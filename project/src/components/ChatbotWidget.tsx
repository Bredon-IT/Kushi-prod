import React, { useState } from "react";
import { X, Send, MessageCircle } from "lucide-react";
import Global_API_BASE from "../services/GlobalConstants";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const res = await fetch(`${Global_API_BASE}/api/chatbot/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    const botMsg = { sender: "bot", text: data.reply };

    setMessages((prev) => [...prev, botMsg]);
    setInput("");
  };

  return (
    <div>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
            fixed bottom-24 right-6 
            z-[9999]                     
            bg-navy-700 hover:bg-peach-300 
            text-white shadow-lg
            w-14 h-14 flex items-center justify-center
            rounded-full transition-all
          "
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className="
            fixed bottom-24 right-6 
            z-[9999]                     
            w-96 bg-white shadow-2xl rounded-2xl 
            overflow-hidden animate-fadeInUp border border-gray-200
          "
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-peach-300 to-navy-700 text-white px-4 py-4 flex justify-between items-center shadow">
            <h2 className="text-lg font-semibold">Kushi Assistant</h2>
            <button onClick={() => setOpen(false)} className="hover:text-gray-200">
              <X size={22} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 no-scrollbar">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    px-4 py-2 max-w-[75%] rounded-xl shadow-sm 
                    text-sm leading-relaxed
                    ${
                      msg.sender === "user"
                        ? "bg-navy-700 text-white rounded-br-none"
                        : "bg-white text-gray-800 border rounded-bl-none"
                    }
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t bg-white flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="
                flex-1 p-3 text-sm border border-gray-300 rounded-xl 
                outline-none focus:ring-2 focus:ring-navy-700
              "
              placeholder="Ask something…"
            />

            <button
              onClick={sendMessage}
              className="
                bg-navy-600 hover:bg-navy-700 
                text-white px-4 py-3 rounded-xl shadow 
                flex items-center justify-center
              "
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        .animate-fadeInUp {
          animation: fadeInUp 0.25s ease-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
