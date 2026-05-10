'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Send, 
  ArrowLeft, 
  Loader2, 
  MessageSquare, 
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import api from '@/lib/api';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { Message, Complaint, Letter, EscalationLetter, AgentReply } from '@/types';
import LetterDisplay from '@/components/letter/LetterDisplay';
import PDFDownloadButton from '@/components/letter/PDFDownloadButton';

export default function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { 
    activeComplaint, setActiveComplaint,
    messages, setMessages, addMessage,
    letter, setLetter,
    escalationLetter, setEscalationLetter,
    isLoading, setLoading 
  } = useStore();

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const [showEscalateButton, setShowEscalateButton] = useState(false);

  useEffect(() => {
    fetchComplaintData();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const fetchComplaintData = async () => {
    setLoading(true);
    try {
      const response = await api.get<Complaint & { messages: Message[] }>(`complaints/${id}`);
      const { messages: history, ...complaint } = response.data;
      setActiveComplaint(complaint);
      setMessages(history);

      // Check for letter
      try {
        const letterRes = await api.get<Letter>(`complaints/${id}/letter`);
        setLetter(letterRes.data);
      } catch (e) {
        setLetter(null);
      }

      // Check for escalation
      try {
        const escalationRes = await api.get<EscalationLetter>(`complaints/${id}/letter/escalate`);
        setEscalationLetter(escalationRes.data);
      } catch (e) {
        setEscalationLetter(null);
      }

    } catch (error) {
      toast.error('Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessageContent = input.trim();
    setInput('');
    setSending(true);

    // Optimistic user message
    const tempUserMsg: Message = {
      _id: Date.now().toString(),
      complaintId: id,
      role: 'user',
      content: userMessageContent,
      createdAt: new Date().toISOString()
    };
    addMessage(tempUserMsg);

    try {
      const response = await api.post<AgentReply>(`complaints/${id}/messages`, {
        content: userMessageContent
      });

      const { reply, stage, ready_for_letter, messageId, action, letter: revisedLetter } = response.data;

      // Add agent message
      const agentMsg: Message = {
        _id: messageId,
        complaintId: id,
        role: 'agent',
        content: reply,
        createdAt: new Date().toISOString()
      };
      addMessage(agentMsg);

      // Update complaint state
      if (activeComplaint) {
        setActiveComplaint({ ...activeComplaint, stage });
      }

      if (ready_for_letter) {
        setShowGenerateButton(true);
        toast.success('Your complaint letter is ready!');
      }

      if (stage === 'escalate') {
        setShowEscalateButton(true);
      }

      if (action === 'edit_letter' && revisedLetter) {
        setLetter(revisedLetter);
        toast.success('Letter updated');
      }

    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleGenerateLetter = async () => {
    setIsGeneratingLetter(true);
    try {
      const response = await api.post<Letter>(`complaints/${id}/letter`);
      setLetter(response.data);
      if (activeComplaint) {
        setActiveComplaint({ ...activeComplaint, letterGenerated: true, stage: 'draft' });
      }
      setShowGenerateButton(false);
      toast.success('Complaint letter generated!');
    } catch (error) {
      toast.error('Failed to generate letter');
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const handleEscalate = async () => {
    setIsEscalating(true);
    try {
      const response = await api.post<EscalationLetter>(`complaints/${id}/letter/escalate`);
      setEscalationLetter(response.data);
      if (activeComplaint) {
        setActiveComplaint({ ...activeComplaint, escalationGenerated: true, stage: 'escalate' });
      }
      setShowEscalateButton(false);
      toast.success('Escalation letter generated!');
    } catch (error) {
      toast.error('Failed to escalate');
    } finally {
      setIsEscalating(false);
    }
  };

  if (isLoading && !activeComplaint) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="animate-spin text-gray-400 mb-4" size={48} />
        <p className="text-gray-500 animate-pulse">Loading resolution data...</p>
      </div>
    );
  }

  if (!activeComplaint) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-120px)] lg:overflow-hidden">
      {/* Left Column: Chat */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm h-[60vh] lg:h-auto">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                {activeComplaint.summary || 'AI Investigation'}
              </h2>
              <div className="flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full ${
                  activeComplaint.stage === 'understand' ? 'bg-blue-500' : 
                  activeComplaint.stage === 'draft' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></span>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  {activeComplaint.stage} Stage
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
              <MessageSquare size={48} className="text-gray-300" />
              <p className="text-sm text-gray-500 max-w-xs">
                Describe your issue to Redress AI to start the resolution process.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg._id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-none' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200/50 dark:border-gray-700'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none">
                <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <form onSubmit={sendMessage} className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
              disabled={sending}
              placeholder={sending ? "Waiting for agent..." : "Type your message..."}
              rows={1}
              className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white transition-all resize-none dark:text-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="absolute right-2 top-1.5 p-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Actions & Letters */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar pb-10">
        {/* Stage Actions */}
        <div className="bg-black text-white dark:bg-white dark:text-black p-6 rounded-2xl space-y-4 shadow-xl shadow-black/5 dark:shadow-white/5">
          <div className="flex items-center space-x-2 opacity-80 text-xs font-bold uppercase tracking-widest">
            <ShieldAlert size={14} />
            <span>Resolution Actions</span>
          </div>
          
          <div className="space-y-3">
            {(showGenerateButton || (activeComplaint.stage === 'draft' && !activeComplaint.letterGenerated)) && (
              <button 
                onClick={handleGenerateLetter}
                disabled={isGeneratingLetter}
                className="w-full flex items-center justify-between bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 p-4 rounded-xl border border-white/20 dark:border-black/20 transition-all group disabled:opacity-50"
              >
                <div className="text-left">
                  <p className="font-semibold text-sm">Generate Complaint Letter</p>
                  <p className="text-[10px] opacity-60">Ready to generate</p>
                </div>
                {isGeneratingLetter ? <Loader2 className="animate-spin" size={18} /> : <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            )}

            {(showEscalateButton || (activeComplaint.stage === 'escalate' && !activeComplaint.escalationGenerated)) && (
              <button 
                onClick={handleEscalate}
                disabled={isEscalating}
                className="w-full flex items-center justify-between p-4 rounded-xl border transition-all group disabled:opacity-50 bg-red-500/20 border-red-500/30 hover:bg-red-500/30"
              >
                <div className="text-left">
                  <p className="font-semibold text-sm text-red-200 dark:text-red-700">Escalate to Regulator</p>
                  <p className="text-[10px] text-red-300/60 dark:text-red-700/60">Action Required</p>
                </div>
                {isEscalating ? <Loader2 className="animate-spin" size={18} /> : <ShieldAlert size={18} className="text-red-300" />}
              </button>
            )}

            {!letter && !showGenerateButton && activeComplaint.stage === 'understand' && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                <p className="text-xs opacity-60 italic">Your complaint letter will appear here once the agent is ready.</p>
              </div>
            )}
          </div>
        </div>

        {/* Letter Panel */}
        <div className="space-y-6">
          {letter && (
            <div className="space-y-4">
              <LetterDisplay 
                title="Formal Complaint Letter"
                letter={letter.letter}
                recipient={letter.recipient}
                channel={letter.channel}
                regulator={{
                  name: letter.regulatorName,
                  contact: letter.regulatorContact,
                  country: letter.regulatorCountry
                }}
              />
              <PDFDownloadButton letter={letter.letter} filename="redress-complaint.pdf" />
            </div>
          )}

          {escalationLetter && (
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <LetterDisplay 
                title="Escalation to Regulator"
                letter={escalationLetter.escalationLetter}
                recipient={escalationLetter.regulatorName}
                channel="Regulatory Portal"
                regulator={{
                  name: escalationLetter.regulatorName,
                  contact: escalationLetter.regulatorContact,
                  filing_instructions: escalationLetter.filingInstructions
                }}
              />
              <PDFDownloadButton letter={escalationLetter.escalationLetter} filename="redress-escalation.pdf" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
