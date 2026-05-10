import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import Message from '@/lib/models/Message';
import Letter from '@/lib/models/Letter';
import { searchRegulator } from '@/lib/search';
import { applySenderName } from '@/lib/letter-utils';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userSession = await getSessionUser(req);
    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    if (complaint.userId.toString() !== userSession.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const letter = await Letter.findOne({ complaintId: id });
    if (!letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    return NextResponse.json(letter);
  } catch (error: any) {
    console.error('Error fetching letter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userSession = await getSessionUser(req);
    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Verify ownership
    if (complaint.userId.toString() !== userSession.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check stage
    if (complaint.stage !== 'draft') {
      return NextResponse.json({ error: 'Not ready for letter generation.', code: 409 }, { status: 409 });
    }

    // Check if exists
    const existingLetter = await Letter.findOne({ complaintId: id });
    if (existingLetter) {
      return NextResponse.json(existingLetter);
    }

    // Fetch message history for context
    const messages = await Message.find({ complaintId: id }).sort({ createdAt: 1 });
    const messageContext = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

    // Extract country and sector for search
    let searchResults = '';
    try {
      const extractionPrompt = `Based on this complaint conversation, extract two things and respond ONLY with valid JSON, nothing else:
{
  "country": "the country this complaint is about",
  "sector": "one of: banking, telecom, utility, housing, government, ecommerce, other"
}`;
      
      const extractionResponse = await fetch(process.env.AMD_API_URL!, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AMD_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: extractionPrompt },
            { role: 'user', content: messageContext }
          ],
          temperature: 0,
          response_format: { type: 'json_object' }
        })
      });

      if (extractionResponse.ok) {
        const extractionData = await extractionResponse.json();
        const extracted = JSON.parse(extractionData.choices[0].message.content.trim().replace(/^```json/, '').replace(/```$/, ''));
        if (extracted.country && extracted.sector) {
          searchResults = await searchRegulator(extracted.country, extracted.sector);
        }
      }
    } catch (e) {
      console.error('Extraction/Search failed, proceeding without it:', e);
    }

    const senderName = userSession.name || '';
    let systemPrompt = `You are a professional legal letter writer. Based on the complaint conversation provided, write a formal complaint letter.

The letter must include:
- Today's date
- A formal salutation
- A clear description of the issue
- What resolution the complainant is requesting
- A deadline of 14 days for response
- A professional closing signed off with the sender's name${senderName ? `: "${senderName}"` : ''}

Do NOT use placeholders like [Your Name] in the signature — write the actual name above.

Also identify:
- The recipient title and organization
- The recommended channel to send this letter (email or post)
- The relevant regulatory body for this type of complaint and country, including their contact details

${searchResults ? `Additional regulatory information from web search:
${searchResults}

Use this information to ensure the regulator name, contact details, and filing channel are accurate.` : ''}

Respond ONLY with a valid JSON object in this exact format and nothing else:
{
  "letter": "full letter text here",
  "recipient": "Customer Service Manager, [Organization]",
  "channel": "email",
  "regulator": {
    "name": "regulator name",
    "contact": "regulator contact",
    "country": "country"
  }
}`;

    let aiResponseContent = '';
    try {
      const response = await fetch(process.env.AMD_API_URL!, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AMD_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Conversation history:\n${messageContext}` }
          ],
          max_tokens: 2048,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`AMD API error: ${response.statusText}`);
      }

      const data = await response.json();
      aiResponseContent = data.choices[0].message.content;
    } catch (error) {
      console.error('AMD API Call failed:', error);
      return NextResponse.json({ error: 'Agent unavailable. Please try again.', code: 500 }, { status: 500 });
    }

    let parsedLetter;
    try {
      // Clean up markdown code blocks if AI included them
      const cleaned = aiResponseContent.replace(/^```json/, '').replace(/```$/, '').trim();
      parsedLetter = JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', aiResponseContent);
      return NextResponse.json({ error: 'Failed to generate a valid letter structure. Please try again.', code: 500 }, { status: 500 });
    }

    const finalLetterText = applySenderName(parsedLetter.letter, senderName);

    // Save to MongoDB
    const letter = await Letter.create({
      complaintId: id,
      letter: finalLetterText,
      recipient: parsedLetter.recipient,
      channel: parsedLetter.channel,
      regulatorName: parsedLetter.regulator.name,
      regulatorContact: parsedLetter.regulator.contact,
      regulatorCountry: parsedLetter.regulator.country
    });

    // Update complaint
    complaint.letterGenerated = true;
    await complaint.save();

    return NextResponse.json(letter, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST letter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
