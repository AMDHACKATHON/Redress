import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import Message from '@/lib/models/Message';
import Letter from '@/lib/models/Letter';
import User from '@/lib/models/User';
import { applySenderName } from '@/lib/letter-utils';

const AMD_API_URL = process.env.AMD_API_URL;
const AMD_API_KEY = process.env.AMD_API_KEY;
const MODEL = 'llama-3.3-70b-versatile';

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

    // Fetch messages for context
    const messages = await Message.find({ complaintId: id }).sort({ createdAt: 1 });
    const historyText = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

    const senderUser = await User.findById(userSession.id).select('name address country');
    const senderName = (senderUser?.name || userSession.name || '').trim();
    const senderAddress = (senderUser?.address || '').trim();
    const senderCountry = (senderUser?.country || '').trim();
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const senderLines: string[] = [];
    if (senderName) senderLines.push(`- Sender's name: ${senderName}`);
    if (senderAddress) senderLines.push(`- Sender's address: ${senderAddress}`);
    if (senderCountry) senderLines.push(`- Sender's country: ${senderCountry}`);
    const senderBlockHints = senderLines.length
      ? senderLines.join('\n')
      : '- (No sender info provided — skip the sender address block)';

    const prompt = `Generate a formal complaint letter based on the conversation history below.
Return ONLY a JSON object with no other text.

Conversation History:
${historyText}

The "letter" field must follow this structure exactly, with a blank line between each section:

1. SENDER ADDRESS BLOCK at the top-left:
${senderBlockHints}

2. DATE: ${today}

3. RECIPIENT BLOCK: title and organization (and HQ location if commonly known). Do NOT invent a fake street address.

4. SALUTATION (e.g. "Dear Customer Service Manager,")

5. BODY: clear description of the issue, resolution requested, 14-day response deadline.

6. CLOSING ("Sincerely,") then signature line${senderName ? `: ${senderName}` : ''}.

Use \\n for line breaks within a block, and \\n\\n for blank lines between sections. Do NOT use placeholders like [Your Name], [Your Address], [Your Email] — omit any line whose value is missing.

Return ONLY a JSON object in this format:
{
  "letter": "<full letter text>",
  "recipient": "<who it's addressed to>",
  "recipientContact": "<the company's customer service email if commonly known, else null>",
  "channel": "<how to send it>",
  "regulatorName": "<relevant regulatory body>",
  "regulatorContact": "<regulator email or website>",
  "regulatorCountry": "<country>"
}

For "recipientContact": only include a real email address you are confident about. If unsure, return null — do not invent emails.
No markdown, no explanation. Pure JSON only.`;

    const response = await fetch(AMD_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AMD_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate letter from AI');
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    content = content.replace(/^```json/, '').replace(/```$/, '').trim();

    const parsedLetter = JSON.parse(content);
    parsedLetter.letter = applySenderName(parsedLetter.letter, senderName);
    if (parsedLetter.recipientContact) {
      const v = String(parsedLetter.recipientContact).trim();
      parsedLetter.recipientContact = v && !/^null$/i.test(v) ? v : null;
    } else {
      parsedLetter.recipientContact = null;
    }

    // Save to Letter collection
    const letter = await Letter.create({
      complaintId: id,
      ...parsedLetter,
    });

    // Update complaint
    complaint.letterGenerated = true;
    await complaint.save();

    return NextResponse.json(letter);

  } catch (error: any) {
    console.error('Error generating letter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
