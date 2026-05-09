import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import Message from '@/lib/models/Message';
import Letter from '@/lib/models/Letter';
import EscalationLetter from '@/lib/models/EscalationLetter';

const AMD_API_URL = process.env.AMD_API_URL;
const AMD_API_KEY = process.env.AMD_API_KEY;
const MODEL = 'meta-llama/Llama-3.1-405B-Instruct';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Verify ownership
    if (complaint.userId.toString() !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch existing Letter
    const existingLetter = await Letter.findOne({ complaintId: id });
    if (!existingLetter) {
      return NextResponse.json({ error: 'Original letter not found. Please generate it first.' }, { status: 400 });
    }

    // Fetch recent messages (last 10)
    const recentMessages = await Message.find({ complaintId: id }).sort({ createdAt: -1 }).limit(10);
    const contextText = recentMessages.reverse().map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

    const prompt = `The user's complaint was ignored. Generate an escalation letter to the regulator.
Return ONLY a JSON object with no other text.

Original letter was sent to: ${existingLetter.recipient}
Regulator: ${existingLetter.regulatorName} — ${existingLetter.regulatorContact}
Country: ${existingLetter.regulatorCountry}

Recent Context:
${contextText}

Return ONLY a JSON object in this format:
{
  "escalationLetter": "<full escalation letter text>",
  "regulatorName": "<regulator name>",
  "regulatorContact": "<regulator contact>",
  "filingInstructions": "<step by step how to file with this regulator in ${existingLetter.regulatorCountry}>"
}
Today's date: ${new Date().toLocaleDateString()}. Reference the original complaint. Request intervention. Sign off as [Your Name].
No markdown, no explanation. Pure JSON only.`;

    const response = await fetch(`${AMD_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AMD_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate escalation letter from AI');
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    content = content.replace(/^```json/, '').replace(/```$/, '').trim();

    const parsedEscalation = JSON.parse(content);

    // Save to EscalationLetter collection
    const escalation = await EscalationLetter.create({
      complaintId: id,
      ...parsedEscalation,
    });

    // Update complaint
    complaint.escalationGenerated = true;
    complaint.stage = "escalate";
    await complaint.save();

    return NextResponse.json(escalation);

  } catch (error: any) {
    console.error('Error generating escalation letter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const escalation = await EscalationLetter.findOne({ complaintId: id });
    if (!escalation) {
      return NextResponse.json({ error: 'Escalation letter not found' }, { status: 404 });
    }

    return NextResponse.json(escalation);
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
