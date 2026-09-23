import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, ShoppingBag } from 'lucide-react';
import { api } from '../lib/api';
import type { ChatMessage, ChatResponse } from '../lib/api';

interface DisplayMessage extends ChatMessage {
  retrieved?: ChatResponse['retrieved'];
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([
    { role: 'assistant', content: '¡Hola! Soy el asistente de compras de TechModa. ¿En qué te puedo ayudar hoy?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const history = messages.filter((m) => m.content);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAssistant(text, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply, retrieved: res.retrieved }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Lo siento, tuve un problema para responder. Intenta de nuevo.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 z-50"
          aria-label="Abrir asistente de compras"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[32rem] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">Asistente TechModa</p>
                <p className="text-xs text-blue-100">Bedrock RAG · S8</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Cerrar chat">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  {m.content}
                  {m.retrieved && m.retrieved.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-1">
                      {m.retrieved.map((p) => (
                        <span key={p.productId} className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-600">
                          {p.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-lg rounded-bl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Preguntame sobre productos..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
