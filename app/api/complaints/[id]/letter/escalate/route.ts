import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import Message from '@/lib/models/Message';
import Letter from '@/lib/models/Letter';
import EscalationLetter from '@/lib/models/EscalationLetter';
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

    const escalation = await EscalationLetter.findOne({ complaintId: id });
    if (!escalation) {
      return NextResponse.json({ error: 'Escalation letter not found' }, { status: 404 });
    }

    return NextResponse.json(escalation);
  } catch (error: any) {
    console.error('Error fetching escalation letter:', error);
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

    // Check letterGenerated
    if (!complaint.letterGenerated) {
      return NextResponse.json({ error: 'Generate a complaint letter first.', code: 409 }, { status: 409 });
    }

    // Check if exists
    const existingEscalation = await EscalationLetter.findOne({ complaintId: id });
    if (existingEscalation) {
      return NextResponse.json(existingEscalation);
    }

    // Fetch original letter and history
    const originalLetter = await Letter.findOne({ complaintId: id });
    const messages = await Message.find({ complaintId: id }).sort({ createdAt: 1 });
    const messageContext = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

    // Search for additional regulatory info
    let searchResults = '';
    try {
      const country = originalLetter?.regulatorCountry || complaint.country;
      const sector = complaint.complaintType || 'consumer';
      if (country && sector) {
        searchResults = await searchRegulator(country, sector);
      }
    } catch (e) {
      console.error('Search failed, proceeding without it:', e);
    }

    const senderName = userSession.name || '';
    const systemPrompt = `You are a professional legal letter writer specializing in regulatory complaints. Based on the original complaint letter and conversation provided, write a formal escalation letter addressed to the relevant regulatory body.

The escalation letter must include:
- Today's date
- Reference to the original complaint and date it was sent
- The fact that no satisfactory response was received
- A clear request for regulatory intervention
- A professional closing signed off with the sender's name${senderName ? `: "${senderName}"` : ''}

Do NOT use placeholders like [Your Name] in the signature — write the actual name above.

Also provide step-by-step filing instructions for submitting to this regulator.

${searchResults ? `Additional regulatory information from web search:
${searchResults}

Use this information to ensure the regulator name, contact details, and filing instructions are accurate.` : ''}

Respond ONLY with a valid JSON object in this exact format and nothing else:
{
  "escalation_letter": "full escalation letter text here",
  "regulator": {
    "name": "regulator name",
    "contact": "regulator contact email or address",
    "filing_instructions": "step by step instructions on how to file"
  }
}`;

    const userContent = `Original Complaint Letter:\n${originalLetter?.letter}\n\nConversation history:\n${messageContext}`;

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
            { role: 'user', content: userContent }
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

    let parsedEscalation;
    try {
      const cleaned = aiResponseContent.replace(/^```json/, '').replace(/```$/, '').trim();
      parsedEscalation = JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', aiResponseContent);
      return NextResponse.json({ error: 'Failed to generate a valid escalation letter structure.', code: 500 }, { status: 500 });
    }

    // Save to MongoDB
    const escalation = await EscalationLetter.create({
      complaintId: id,
      escalationLetter: applySenderName(parsedEscalation.escalation_letter, senderName),
      regulatorName: parsedEscalation.regulator.name,
      regulatorContact: parsedEscalation.regulator.contact,
      filingInstructions: parsedEscalation.regulator.filing_instructions
    });

    // Update complaint
    complaint.escalationGenerated = true;
    complaint.stage = 'escalate';
    await complaint.save();

    return NextResponse.json(escalation, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST escalation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
