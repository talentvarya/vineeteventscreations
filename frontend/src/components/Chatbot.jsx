import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

const SUGGESTIONS = [
  "Wedding planning cost?",
  "Book Russian dancers",
  "Cold pyro for entry",
  "Mickey mascot for birthday",
];

export const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Namaste! 🎉 Main Dhamaka AI hoon, Vineet Events ka assistant. Aapka event kaisa dhamakedar banayein? Poochhiye services, pricing ya artists ke baare mein!" },
  ]);
  const sessionId = useRef(localStorage.getItem("vec_chat_session") || `sess_${Date.now()}`);
  const scrollRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("vec_chat_session", sessionId.current);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post("/chat", { session_id: sessionId.current, message: msg });
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, technical issue! Call us at +91-8588838594." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        data-testid="chatbot-open-button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI chat"
        className="fixed left-4 bottom-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-[0_8px_30px_rgba(234,179,8,0.5)] btn-glow"
      >
        {open ? <X className="w-6 h-6 text-[#0A0508]" /> : <MessageCircle className="w-6 h-6 text-[#0A0508]" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            data-testid="chatbot-window"
            className="fixed left-4 bottom-24 z-[60] w-[calc(100vw-2rem)] sm:w-96 h-[70vh] sm:h-[520px] glass-card rounded-2xl overflow-hidden flex flex-col gold-border-glow"
          >
            <div className="bg-gradient-to-r from-[#4C0519] to-[#881337] px-4 py-3 flex items-center gap-3 border-b border-yellow-500/20">
              <div className="w-9 h-9 rounded-full bg-yellow-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#0A0508]" />
              </div>
              <div>
                <div className="font-display font-bold text-yellow-300 text-sm">Dhamaka AI Assistant</div>
                <div className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Online now
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-medium rounded-br-sm"
                        : "bg-[#1e0f18] text-slate-200 border border-yellow-500/15 rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#1e0f18] border border-yellow-500/15 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs px-3 py-1.5 rounded-full border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500 hover:text-[#0A0508] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-yellow-500/20 flex items-center gap-2">
              <input
                data-testid="chatbot-input-field"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type your query..."
                className="flex-1 bg-[#1e0f18] border border-yellow-500/20 rounded-full px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-yellow-500/60"
              />
              <button
                data-testid="chatbot-send-button"
                onClick={() => send()}
                disabled={loading}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-[#0A0508]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
