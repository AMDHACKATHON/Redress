import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import Message from '@/lib/models/Message';

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
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    await connectDB();

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Verify ownership
    if (complaint.userId.toString() !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Save user message
    await Message.create({
      complaintId: id,
      role: 'user',
      content,
    });

    // Fetch all messages for history
    const history = await Message.find({ complaintId: id }).sort({ createdAt: 1 });

    // Select system prompt
    let systemPrompt = "";
    if (complaint.stage === "understand") {
      systemPrompt = `You are Redress, an AI complaint resolution agent. Help the user file a formal complaint.
Gather: what happened, which company, what country, what outcome they want, approximate date.
Ask ONE question per reply. Maximum 3 clarifying questions total across the conversation.
When you have enough info, end your reply with exactly:
\`\`\`json
{"signal": "ready_for_letter", "stage": "understand", "complaint_type": "<type>", "country": "<country>"}
\`\`\`
Complaint types: bank | telco | utility | landlord | government | other
Do not draft the letter. Do not include the JSON block until you have enough info.`;
    } else if (complaint.stage === "draft") {
      systemPrompt = `You are Redress. The complaint letter has been generated. Answer follow-up questions about it.
If the user says their complaint was ignored or they want to escalate, end your reply with exactly:
\`\`\`json
{"signal": "escalate", "stage": "escalate"}
\`\`\`
Otherwise respond normally with no JSON block.`;
    } else if (complaint.stage === "escalate") {
      systemPrompt = `You are Redress. An escalation letter has been sent to the regulator. Answer questions about it helpfully. No JSON signals needed.`;
    }

    // Call AMD API
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch(`${AMD_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AMD_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AMD API Error:', errorData);
      throw new Error('Failed to fetch from AI agent');
    }

    const data = await response.json();
    let agentReply = data.choices[0].message.content;

    // Parse signal block
    let parsedSignal = null;
    const jsonRegex = /```json\s*(\{[\s\S]*?\})\s*```/;
    const match = agentReply.match(jsonRegex);

    if (match) {
      try {
        parsedSignal = JSON.parse(match[1]);
        // Strip signal block from reply
        agentReply = agentReply.replace(jsonRegex, '').trim();
      } catch (e) {
        console.error('Failed to parse signal JSON:', e);
      }
    }

    // Handle signals
    let updatedStage = complaint.stage;
    if (parsedSignal?.signal === "ready_for_letter") {
      complaint.stage = "draft";
      complaint.complaintType = parsedSignal.complaint_type;
      complaint.country = parsedSignal.country;
      await complaint.save();
      updatedStage = "draft";
    } else if (parsedSignal?.signal === "escalate") {
      complaint.stage = "escalate";
      await complaint.save();
      updatedStage = "escalate";
    }

    // Save agent reply
    await Message.create({
      complaintId: id,
      role: 'agent',
      content: agentReply,
    });

    return NextResponse.json({
      reply: agentReply,
      signal: parsedSignal,
      stage: updatedStage,
    });

  } catch (error: any) {
    console.error('Error in message route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
