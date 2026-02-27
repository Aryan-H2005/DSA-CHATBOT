import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Trash2, Sparkles, Terminal } from 'lucide-react';
import Markdown from 'react-markdown';
import { getChatResponse } from './services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "I am the DSA Sage. Ask me about arrays, trees, or dynamic programming. Don't waste my time with anything else.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const responseText = await getChatResponse(input, history);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'model',
        text: "Reset complete. Now, ask something algorithmically significant.",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto h-screen flex flex-col p-4 md:p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Terminal className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                DSA Sage <Sparkles className="w-4 h-4 text-emerald-400" />
              </h1>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Algorithm Specialist</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-red-400"
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border",
                  msg.role === 'user' 
                    ? "bg-zinc-800 border-zinc-700" 
                    : "bg-emerald-500/10 border-emerald-500/20"
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-400" />}
                </div>
                
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-md",
                  msg.role === 'user' 
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-zinc-100 rounded-tr-none" 
                    : "bg-white/5 border border-white/10 text-zinc-200 rounded-tl-none"
                )}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                  <div className="mt-2 text-[10px] opacity-30 font-mono">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 mr-auto"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="mt-6 relative">
          <div className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-full pointer-events-none" />
          <div className="relative flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl focus-within:border-emerald-500/50 transition-all shadow-2xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about Data Structures..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 py-2 placeholder:text-zinc-600"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-2 rounded-xl transition-all",
                input.trim() && !isLoading 
                  ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-center mt-3 text-zinc-600 font-mono uppercase tracking-tighter">
            Complexity: O(log n) • Status: Online
          </p>
        </div>
      </div>
    </div>
  );
}
