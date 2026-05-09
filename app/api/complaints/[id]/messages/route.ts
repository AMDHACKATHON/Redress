import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import Message from '@/lib/models/Message';

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

    // Check ownership
    if (complaint.userId.toString() !== userSession.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await Message.find({ complaintId: id }).sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('Error fetching messages:', error);
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
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    await connectDB();

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Check ownership
    if (complaint.userId.toString() !== userSession.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Save user message
    const userMessage = await Message.create({
      complaintId: id,
      role: 'user',
      content
    });

    // Fetch full message history
    const history = await Message.find({ complaintId: id }).sort({ createdAt: 1 });

    // Build messages array for AMD API
    const systemPrompt = `You are Redress, an AI complaint resolution agent. Your job is to help users draft formal complaint letters and escalate to regulators if needed.

Follow these rules strictly:
1. Start by understanding the user's complaint. Ask a maximum of 3 short clarifying questions to gather: the organization name, the nature of the issue, the date it occurred, and any reference numbers or prior contact attempts.
2. Once you have enough information (after at most 3 questions), respond with exactly this JSON object and nothing else:
{"action": "ready_for_letter", "summary": "one sentence summary of the complaint"}
3. If the user says their complaint was ignored or rejected, respond with exactly this JSON object and nothing else:
{"action": "escalate"}
4. For all other responses, reply in plain conversational English. Be empathetic, clear, and professional. Never use bullet points or markdown in your replies.`;

    const messagesArray = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }))
    ];

    let agentReply = '';
    try {
      const response = await fetch(process.env.AMD_API_URL!, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AMD_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.1-70B-Instruct',
          messages: messagesArray,
          max_tokens: 1024,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`AMD API error: ${response.statusText}`);
      }

      const data = await response.json();
      agentReply = data.choices[0].message.content;
    } catch (error) {
      console.error('AMD API Call failed:', error);
      return NextResponse.json({ error: 'Agent unavailable. Please try again.', code: 500 }, { status: 500 });
    }

    let ready_for_letter = false;
    let stage = complaint.stage;
    let displayReply = agentReply;

    // Stage logic
    try {
      const parsed = JSON.parse(agentReply);
      if (parsed.action === 'ready_for_letter') {
        stage = 'draft';
        complaint.stage = 'draft';
        complaint.summary = parsed.summary;
        ready_for_letter = true;
        displayReply = "I have everything I need. Click Generate Letter to get your formal complaint letter.";
      } else if (parsed.action === 'escalate') {
        stage = 'escalate';
        complaint.stage = 'escalate';
        displayReply = "Understood. Click Escalate to Regulator to generate your escalation letter.";
      }
      await complaint.save();
    } catch (e) {
      // Not JSON, treat as plain text
    }

    // Save agent reply
    const agentMessage = await Message.create({
      complaintId: id,
      role: 'agent',
      content: displayReply
    });

    return NextResponse.json({
      messageId: agentMessage._id,
      reply: displayReply,
      stage: stage,
      ready_for_letter: ready_for_letter,
      clarifying_questions_done: ready_for_letter
    });

  } catch (error: any) {
    console.error('Error in POST messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
