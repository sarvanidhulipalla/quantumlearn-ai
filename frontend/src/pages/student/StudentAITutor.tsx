import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  Lightbulb,
  BookOpen,
  Cpu,
  Terminal,
  Trash2,
  Plus,
  MessageSquare,
  ChevronRight,
  HelpCircle,
  CheckCircle,
  Flame,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  aiService,
  AIChatMessage,
  AIConversationSummary,
  AISourceItem,
} from '../../services/aiService';
import PageContainer from '../../components/common/PageContainer';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const STARTER_PROMPTS = [
  'Explain superposition simply.',
  'What does the Hadamard gate do?',
  'Why did my Bell State produce 00 and 11?',
  'Explain how the CNOT gate entangles qubits.',
  'Explain this Qiskit code.',
  'Give me a hint on preparing a Bell State.',
];

const QUICK_ACTIONS = [
  { label: 'Explain Superposition', prompt: 'Explain quantum superposition and the Hadamard gate in simple terms.' },
  { label: 'Why 00 and 11 in Bell State?', prompt: 'Why does the Bell State (|Φ⁺⟩) only produce outcomes 00 and 11 when measured?' },
  { label: 'Bloch Sphere Coordinates', prompt: 'How do the polar angle θ and phase angle φ represent a qubit on the Bloch sphere?' },
  { label: 'Theoretical vs Shot Noise', prompt: 'Why do experimental Qiskit Aer shot counts slightly differ from exact 50/50 probabilities?' },
];

export const StudentAITutor: React.FC = () => {
  const location = useLocation();
  const locationState = location.state as {
    initialPrompt?: string;
    lessonTitle?: string;
    lessonContent?: string;
    circuit?: any;
    simulationResults?: any;
  } | null;

  // Conversations & Active Chat State
  const [conversations, setConversations] = useState<AIConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | undefined>(undefined);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeContext, setActiveContext] = useState<Record<string, any> | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load conversation list on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Handle incoming route context (from Lesson or Playground)
  useEffect(() => {
    if (locationState) {
      if (locationState.lessonTitle) {
        setActiveContext({
          type: 'lesson',
          lesson: {
            title: locationState.lessonTitle,
            snippet: locationState.lessonContent?.slice(0, 300),
          },
        });
      } else if (locationState.circuit) {
        setActiveContext({
          type: 'circuit',
          circuit: locationState.circuit,
          results: locationState.simulationResults,
        });
      }

      if (locationState.initialPrompt) {
        handleSendMessage(locationState.initialPrompt, {
          type: locationState.lessonTitle ? 'lesson' : 'circuit',
          lesson: locationState.lessonTitle ? { title: locationState.lessonTitle } : undefined,
          circuit: locationState.circuit,
          results: locationState.simulationResults,
        });
      }
    }
  }, [locationState]);

  const loadConversations = async () => {
    try {
      const list = await aiService.getConversations();
      setConversations(list);
    } catch (e) {
      console.warn('Failed to load conversations list:', e);
    }
  };

  const handleSelectConversation = async (convId: number) => {
    try {
      setIsLoading(true);
      setActiveConversationId(convId);
      const detail = await aiService.getConversationDetail(convId);
      setMessages(
        detail.messages.map((m) => ({
          id: m.id,
          sender: m.sender,
          content: m.content,
          suggested_follow_ups: m.suggested_actions,
          created_at: m.created_at,
        }))
      );
    } catch (e) {
      console.error('Failed to load conversation details:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewChat = () => {
    setActiveConversationId(undefined);
    setMessages([]);
    setInputPrompt('');
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: number) => {
    e.stopPropagation();
    try {
      await aiService.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        handleStartNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSendMessage = async (
    promptToSend?: string,
    overrideContext?: Record<string, any>
  ) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      sender: 'user',
      content: text.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const contextToSend = overrideContext || activeContext;
      const res = await aiService.sendMessage(
        text.trim(),
        activeConversationId,
        contextToSend
      );

      setActiveConversationId(res.conversation_id);

      const assistantMsg: AIChatMessage = {
        sender: 'assistant',
        content: res.message,
        sources: res.sources,
        suggested_follow_ups: res.suggested_follow_ups,
        created_at: res.timestamp,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      loadConversations();
    } catch (err: any) {
      console.error('AI chat failed:', err);
      const errorMsg: AIChatMessage = {
        sender: 'assistant',
        content:
          '⚠️ **AI Tutor Notice:** The AI Tutor service encountered a temporary issue. Please verify your connection or try asking again.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickHint = () => {
    handleSendMessage('Can you give me a hint on my current topic?');
  };

  return (
    <PageContainer
      title="AI Quantum Tutor"
      subtitle="Your personal guide to quantum computing."
      badge={<Badge variant="purple" size="sm">Grounded with RAG</Badge>}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartNewChat}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Chat
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] max-h-[85vh]">
        {/* ============================================================ */}
        {/* LEFT COLUMN: Conversation History & Saved Sessions (3 Cols) */}
        {/* ============================================================ */}
        <div className="hidden lg:flex lg:col-span-3 flex-col glass-panel rounded-2xl p-4 border-slate-800 h-full overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Past Sessions</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartNewChat}
              className="text-cyan-400 hover:text-cyan-300 px-2 py-1"
              title="Start New Chat"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No past conversations yet. Start asking questions below!
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = activeConversationId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c.id)}
                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      isActive
                        ? 'bg-purple-950/60 border border-purple-500/40 text-white'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="truncate flex-1">
                      <p className="font-semibold truncate">{c.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {c.message_count} messages • {new Date(c.updated_at).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleDeleteConversation(e, c.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-950/30 transition-colors"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Knowledge Base Status Footer */}
          <div className="pt-3 border-t border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>14 Verified Quantum Modules in RAG Knowledge Base</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTER COLUMN: Main Chat Feed & Input Bar (6 Cols) */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 flex flex-col glass-panel rounded-2xl border-slate-800 h-full overflow-hidden">
          {/* Active Chat Header */}
          <div className="p-3.5 px-5 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/30 border border-cyan-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Quantum AI Mentor</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[10px] text-slate-400">
                  Grounded Socratic Learning Engine
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuickHint}
              leftIcon={<Lightbulb className="w-3.5 h-3.5 text-amber-400" />}
              className="text-amber-300 hover:text-amber-200"
            >
              Need a Hint?
            </Button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.length === 0 ? (
              /* Starter / Empty State */
              <div className="h-full flex flex-col justify-center items-center text-center max-w-md mx-auto space-y-5 py-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-purple-600/20 to-pink-500/20 border border-purple-500/40 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-cyan-400" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">
                    What would you like to explore today?
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ask any question about quantum gates, superposition, entanglement, Qiskit code, or get progressive hints.
                  </p>
                </div>

                {/* Starter Prompt Chips */}
                <div className="w-full space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-left">
                    Suggested Starters:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                    {STARTER_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-200 text-left transition-all group cursor-pointer"
                      >
                        <span className="block truncate">{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Message Bubbles */
              messages.map((msg, index) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={index}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-4 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-br-none shadow-md shadow-purple-500/10'
                          : 'bg-[#0b101c] border border-slate-800 text-slate-100 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {/* Markdown text formatted */}
                      <div className="prose prose-invert prose-xs max-w-none space-y-2 whitespace-pre-wrap">
                        {msg.content}
                      </div>

                      {/* Source Citation Banner */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-cyan-300 font-mono">
                          <BookOpen className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>
                            Based on: <strong>{msg.sources[0].title}</strong> ({msg.sources[0].module})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Suggested Follow-up chips */}
                    {!isUser && msg.suggested_follow_ups && msg.suggested_follow_ups.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 pl-2 max-w-[90%]">
                        {msg.suggested_follow_ups.map((followUp, fIdx) => (
                          <button
                            key={fIdx}
                            onClick={() => handleSendMessage(followUp)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-cyan-300 hover:text-cyan-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>{followUp}</span>
                            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Thinking Animation */}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 w-max animate-pulse">
                <Bot className="w-4 h-4 animate-spin" />
                <span>Thinking & retrieving verified quantum knowledge...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3.5 bg-slate-950/60 border-t border-white/5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about gates, circuits, Qiskit code, or request a hint..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-[#080c14] text-xs text-white placeholder-slate-500 rounded-xl px-4 py-3 border border-slate-800 focus:outline-none focus:border-cyan-400 transition-colors"
              />

              <Button
                type="submit"
                variant="glow"
                size="md"
                disabled={!inputPrompt.trim() || isLoading}
                isLoading={isLoading}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send
              </Button>
            </form>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Active Context Panel & Quick AI Actions (3 Cols) */}
        {/* ============================================================ */}
        <div className="hidden lg:flex lg:col-span-3 flex-col glass-panel rounded-2xl p-4 border-slate-800 h-full overflow-hidden space-y-4">
          {/* Context Header */}
          <div className="pb-3 border-b border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Learning Context</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Active student environment sync
            </p>
          </div>

          {/* Active Context Card */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Context Source</span>
              <Badge variant="cyan" size="xs">
                {activeContext?.type ? activeContext.type.toUpperCase() : 'GENERAL'}
              </Badge>
            </div>

            {activeContext?.lesson && (
              <div>
                <p className="font-bold text-white">{activeContext.lesson.title}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                  {activeContext.lesson.snippet}
                </p>
              </div>
            )}

            {activeContext?.circuit && (
              <div>
                <p className="font-bold text-white">
                  Interactive Circuit ({activeContext.circuit.qubits} Qubits)
                </p>
                <p className="text-[11px] text-slate-400">
                  {activeContext.circuit.gates?.length || 0} Gates Placed
                </p>
              </div>
            )}

            {!activeContext && (
              <p className="text-slate-400 text-[11px]">
                Ask general quantum questions or navigate to any lesson or the Quantum Playground to auto-attach live context!
              </p>
            )}
          </div>

          {/* Quick AI Action Cards */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Explanations
            </span>

            {QUICK_ACTIONS.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(action.prompt)}
                className="w-full p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/30 text-xs text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <span className="font-medium text-slate-200 group-hover:text-purple-300">
                  {action.label}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </button>
            ))}
          </div>

          {/* Socratic Pedagogy Notice */}
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200">
            <p className="font-semibold flex items-center gap-1 text-purple-300 mb-1">
              <Lightbulb className="w-3.5 h-3.5" /> Socratic Learning
            </p>
            Your AI Tutor encourages deep understanding by providing step-by-step reasoning rather than raw answers.
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default StudentAITutor;
