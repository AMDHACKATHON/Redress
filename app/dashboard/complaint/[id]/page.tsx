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
    user,
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

      const { reply, stage, ready_for_letter, messageId, action, letter: revisedLetter, summary } = response.data;

      // Add agent message
      const agentMsg: Message = {
        _id: messageId,
        complaintId: id,
        role: 'agent',
        content: reply,
        createdAt: new Date().toISOString()
      };
      addMessage(agentMsg);

      // Update complaint state — pick up the new summary too if the backend updated it
      if (activeComplaint) {
        setActiveComplaint({
          ...activeComplaint,
          stage,
          summary: summary || activeComplaint.summary,
        });
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
      <RightColumn
        showGenerateButton={showGenerateButton}
        showEscalateButton={showEscalateButton}
        activeComplaint={activeComplaint}
        letter={letter}
        escalationLetter={escalationLetter}
        isGeneratingLetter={isGeneratingLetter}
        isEscalating={isEscalating}
        userName={user?.name}
        onGenerate={handleGenerateLetter}
        onEscalate={handleEscalate}
      />
    </div>
  );
}

function RightColumn({
  showGenerateButton,
  showEscalateButton,
  activeComplaint,
  letter,
  escalationLetter,
  isGeneratingLetter,
  isEscalating,
  userName,
  onGenerate,
  onEscalate,
}: {
  showGenerateButton: boolean;
  showEscalateButton: boolean;
  activeComplaint: Complaint;
  letter: Letter | null;
  escalationLetter: EscalationLetter | null;
  isGeneratingLetter: boolean;
  isEscalating: boolean;
  userName?: string;
  onGenerate: () => void;
  onEscalate: () => void;
}) {
  const showGenerate =
    showGenerateButton ||
    (activeComplaint.stage === 'draft' && !activeComplaint.letterGenerated);
  const showEscalate =
    showEscalateButton ||
    (activeComplaint.stage === 'escalate' && !activeComplaint.escalationGenerated);
  const showHint =
    !letter && !showGenerateButton && activeComplaint.stage === 'understand';
  const hasActions = showGenerate || showEscalate || showHint;

  return (
    <div className="w-full lg:w-[400px] flex flex-col gap-5 overflow-y-auto pr-0 lg:pr-2 custom-scrollbar pb-10">
      {hasActions && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <ShieldAlert size={12} />
            <span>Resolution Actions</span>
          </div>

          <div className="space-y-2.5">
            {showGenerate && (
              <button
                type="button"
                onClick={onGenerate}
                disabled={isGeneratingLetter}
                className="w-full group flex items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="text-left min-w-0">
                  <p className="font-semibold text-sm">Generate Complaint Letter</p>
                  <p className="text-[11px] opacity-80">Ready to generate</p>
                </div>
                {isGeneratingLetter ? (
                  <Loader2 className="animate-spin shrink-0" size={18} />
                ) : (
                  <ChevronRight
                    size={18}
                    className="shrink-0 group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>
            )}

            {showEscalate && (
              <button
                type="button"
                onClick={onEscalate}
                disabled={isEscalating}
                className="w-full group flex items-center justify-between gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="text-left min-w-0">
                  <p className="font-semibold text-sm text-red-600 dark:text-red-300">
                    Escalate to Regulator
                  </p>
                  <p className="text-[11px] text-red-500/80 dark:text-red-400/70">
                    Action required
                  </p>
                </div>
                {isEscalating ? (
                  <Loader2 className="animate-spin text-red-500 shrink-0" size={18} />
                ) : (
                  <ShieldAlert className="text-red-500 shrink-0" size={18} />
                )}
              </button>
            )}

            {showHint && (
              <div className="p-4 rounded-xl bg-slate-100/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                  Your complaint letter will appear here once the agent has enough info.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {letter && (
        <div className="space-y-3">
          <LetterDisplay
            title="Formal Complaint Letter"
            letter={letter.letter}
            recipient={letter.recipient}
            recipientContact={letter.recipientContact}
            channel={letter.channel}
            emailSubject={`Formal complaint: ${activeComplaint.summary || 'Service issue'}`}
            regulator={{
              name: letter.regulatorName,
              contact: letter.regulatorContact,
              country: letter.regulatorCountry,
            }}
          />
          <PDFDownloadButton
            letter={letter.letter}
            userName={userName}
            orgName={letter.recipient}
            variant="complaint"
          />
        </div>
      )}

      {escalationLetter && (
        <div className="space-y-3">
          <LetterDisplay
            title="Escalation to Regulator"
            letter={escalationLetter.escalationLetter}
            recipient={escalationLetter.regulatorName}
            recipientContact={escalationLetter.regulatorContact}
            channel="Regulatory Portal"
            emailSubject={`Escalation: ${activeComplaint.summary || 'Unresolved complaint'}`}
            regulator={{
              name: escalationLetter.regulatorName,
              contact: escalationLetter.regulatorContact,
              filing_instructions: escalationLetter.filingInstructions,
            }}
          />
          <PDFDownloadButton
            letter={escalationLetter.escalationLetter}
            userName={userName}
            orgName={letter?.recipient || escalationLetter.regulatorName}
            variant="escalation"
          />
        </div>
      )}
    </div>
  );
}
