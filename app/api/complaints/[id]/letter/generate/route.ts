import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import Message from '@/lib/models/Message';
import Letter from '@/lib/models/Letter';

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

    // Fetch messages for context
    const messages = await Message.find({ complaintId: id }).sort({ createdAt: 1 });
    const historyText = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

    const prompt = `Generate a formal complaint letter based on the conversation history below. 
Return ONLY a JSON object with no other text.

Conversation History:
${historyText}

Return ONLY a JSON object in this format:
{
  "letter": "<full letter text, paragraphs separated by \\n\\n>",
  "recipient": "<who it's addressed to>",
  "channel": "<how to send it>",
  "regulatorName": "<relevant regulatory body>",
  "regulatorContact": "<regulator email or website>",
  "regulatorCountry": "<country>"
}
Today's date: ${new Date().toLocaleDateString()}. Formal tone. Include response deadline of 14 days. Sign off as [Your Name].
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
      throw new Error('Failed to generate letter from AI');
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    content = content.replace(/^```json/, '').replace(/```$/, '').trim();

    const parsedLetter = JSON.parse(content);

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
