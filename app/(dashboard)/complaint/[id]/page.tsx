'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Send, 
  FileText, 
  Download, 
  ArrowLeft, 
  Loader2, 
  MessageSquare, 
  ShieldAlert,
  ChevronRight,
  Printer
} from 'lucide-react';
import api from '@/lib/api';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { generateComplaintPDF, generateEscalationPDF } from '@/lib/pdf';
import { Message, Complaint, Letter, EscalationLetter, AgentReply } from '@/types';

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

  useEffect(() => {
    fetchComplaintData();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchComplaintData = async () => {
    setLoading(true);
    try {
      const [complaintRes, letterRes, escalationRes] = await Promise.allSettled([
        api.get<Complaint & { messages: Message[] }>(`complaints/${id}`),
        api.get<Letter>(`complaints/${id}/letter`),
        api.get<EscalationLetter>(`complaints/${id}/letter/escalate`)
      ]);

      if (complaintRes.status === 'fulfilled') {
        const { messages: history, ...complaint } = complaintRes.value.data;
        setActiveComplaint(complaint);
        setMessages(history);
      }

      if (letterRes.status === 'fulfilled') {
        setLetter(letterRes.value.data);
      } else {
        setLetter(null);
      }

      if (escalationRes.status === 'fulfilled') {
        setEscalationLetter(escalationRes.value.data);
      } else {
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

    // Optimistic user message (temporary ID)
    const tempUserMsg: Message = {
      _id: Date.now().toString(),
      complaintId: id,
      role: 'user',
      content: userMessageContent,
      createdAt: new Date().toISOString()
    };
    addMessage(tempUserMsg);

    try {
      const response = await api.post<AgentReply>(`complaints/${id}/message`, {
        content: userMessageContent
      });

      const { reply, signal, stage } = response.data;

      // Add agent message
      const agentMsg: Message = {
        _id: (Date.now() + 1).toString(),
        complaintId: id,
        role: 'agent',
        content: reply,
        createdAt: new Date().toISOString()
      };
      addMessage(agentMsg);

      // Update complaint state if stage changed
      if (activeComplaint) {
        setActiveComplaint({ ...activeComplaint, stage });
      }

      if (signal?.signal === 'ready_for_letter') {
        toast.success('Your complaint letter is ready to be generated!');
      } else if (signal?.signal === 'escalate') {
        toast.success('Escalation is recommended.');
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
      const response = await api.post<Letter>(`complaints/${id}/letter/generate`);
      setLetter(response.data);
      if (activeComplaint) {
        setActiveComplaint({ ...activeComplaint, letterGenerated: true, stage: 'draft' });
      }
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
    <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6 overflow-hidden">
      {/* Left Column: Chat */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
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
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
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
              placeholder="Type your message..."
              rows={1}
              className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white transition-all resize-none dark:text-white"
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
      <div className="w-full lg:w-[400px] flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        {/* Stage Actions */}
        <div className="bg-black text-white dark:bg-white dark:text-black p-6 rounded-2xl space-y-4 shadow-xl shadow-black/5 dark:shadow-white/5">
          <div className="flex items-center space-x-2 opacity-80 text-xs font-bold uppercase tracking-widest">
            <ShieldAlert size={14} />
            <span>Resolution Actions</span>
          </div>
          
          <div className="space-y-3">
            {(!activeComplaint.letterGenerated) && (
              <button 
                onClick={handleGenerateLetter}
                disabled={isGeneratingLetter || activeComplaint.stage === 'understand'}
                className="w-full flex items-center justify-between bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 p-4 rounded-xl border border-white/20 dark:border-black/20 transition-all group disabled:opacity-50"
              >
                <div className="text-left">
                  <p className="font-semibold text-sm">Generate Complaint Letter</p>
                  <p className="text-[10px] opacity-60">
                    {activeComplaint.stage === 'understand' ? 'Waiting for AI approval...' : 'Ready to generate'}
                  </p>
                </div>
                {isGeneratingLetter ? <Loader2 className="animate-spin" size={18} /> : <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            )}

            {activeComplaint.letterGenerated && (
              <button 
                onClick={() => scrollToLetter('letter')}
                className="w-full flex items-center justify-between bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 p-4 rounded-xl border border-white/20 dark:border-black/20 transition-all group"
              >
                <div className="text-left">
                  <p className="font-semibold text-sm">View Draft Letter</p>
                  <p className="text-[10px] opacity-60">Generated & Ready</p>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {activeComplaint.letterGenerated && !activeComplaint.escalationGenerated && (
              <button 
                onClick={handleEscalate}
                disabled={isEscalating || activeComplaint.stage !== 'escalate'}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all group disabled:opacity-50 ${
                  activeComplaint.stage === 'escalate' 
                  ? 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30' 
                  : 'bg-white/5 border-white/10 opacity-40'
                }`}
              >
                <div className="text-left">
                  <p className={`font-semibold text-sm ${activeComplaint.stage === 'escalate' ? 'text-red-200 dark:text-red-700' : ''}`}>Escalate to Regulator</p>
                  <p className={`text-[10px] ${activeComplaint.stage === 'escalate' ? 'text-red-300/60 dark:text-red-700/60' : ''}`}>
                    {activeComplaint.stage === 'escalate' ? 'Action Required' : 'Available if ignored'}
                  </p>
                </div>
                {isEscalating ? <Loader2 className="animate-spin" size={18} /> : <ShieldAlert size={18} className={activeComplaint.stage === 'escalate' ? 'text-red-300' : 'text-gray-500'} />}
              </button>
            )}

            {activeComplaint.escalationGenerated && (
              <button 
                onClick={() => scrollToLetter('escalation')}
                className="w-full flex items-center justify-between bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 p-4 rounded-xl border border-white/20 dark:border-black/20 transition-all group"
              >
                <div className="text-left">
                  <p className="font-semibold text-sm">View Escalation Letter</p>
                  <p className="text-[10px] opacity-60">Final Resolution Step</p>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Letter Preview */}
        {letter && (
          <div id="letter-section" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center space-x-2">
                <FileText size={16} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Complaint Letter</span>
              </div>
              <button 
                onClick={() => generateComplaintPDF(letter)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500"
                title="Download PDF"
              >
                <Download size={16} />
              </button>
            </div>
            <div className="p-6">
              <div className="text-[11px] text-gray-400 uppercase tracking-widest font-bold mb-4">Content Preview</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap font-serif italic line-clamp-[12]">
                {letter.letter}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Recipient:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{letter.recipient}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Channel:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{letter.channel}</span>
                </div>
                <div className="pt-2">
                  <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Regulator Info</div>
                  <p className="text-xs text-gray-900 dark:text-white font-medium">{letter.regulatorName}</p>
                  <p className="text-[10px] text-gray-500">{letter.regulatorContact}</p>
                </div>
              </div>
              <button 
                onClick={() => generateComplaintPDF(letter)}
                className="w-full mt-6 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 border border-gray-100 dark:border-gray-700"
              >
                <Printer size={14} />
                <span>Download Full PDF</span>
              </button>
            </div>
          </div>
        )}

        {/* Escalation Preview */}
        {escalationLetter && (
          <div id="escalation-section" className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between bg-red-100/30 dark:bg-red-900/20">
              <div className="flex items-center space-x-2">
                <ShieldAlert size={16} className="text-red-500" />
                <span className="text-sm font-semibold text-red-900 dark:text-red-200">Escalation Letter</span>
              </div>
              <button 
                onClick={() => generateEscalationPDF(escalationLetter)}
                className="p-1.5 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors text-red-500"
                title="Download PDF"
              >
                <Download size={16} />
              </button>
            </div>
            <div className="p-6">
              <div className="text-sm text-red-800 dark:text-red-300/80 leading-relaxed whitespace-pre-wrap font-serif italic line-clamp-[10] mb-6">
                {escalationLetter.escalationLetter}
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl border border-red-200/50 dark:border-red-900/20">
                  <h4 className="text-[10px] uppercase font-bold text-red-900 dark:text-red-400 mb-2 tracking-widest">Filing Instructions</h4>
                  <p className="text-xs text-red-800/80 dark:text-red-300/60 leading-relaxed">
                    {escalationLetter.filingInstructions}
                  </p>
                </div>
                
                <div className="flex justify-between text-xs px-1">
                  <span className="text-red-900/50 dark:text-red-400/50">Regulator:</span>
                  <span className="text-red-900 dark:text-red-200 font-bold">{escalationLetter.regulatorName}</span>
                </div>
              </div>

              <button 
                onClick={() => generateEscalationPDF(escalationLetter)}
                className="w-full mt-6 py-3 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-500/20"
              >
                <Download size={14} />
                <span>Download Final Escalation</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function scrollToLetter(type: 'letter' | 'escalation') {
    const id = type === 'letter' ? 'letter-section' : 'escalation-section';
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}
