'use client';

import { useState, useEffect, useRef } from 'react';
import { getPuter, Puter } from '@/lib/puter';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [puter, setPuter] = useState<Puter | null>(null);
    const [loading, setLoading] = useState(false);
    const [modelName] = useState('gpt-4o-mini');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const p = getPuter();
            if (p) {
                setPuter(p);
                clearInterval(interval);
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !puter) return;
        const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await puter.ai.chat(input, { model: modelName });

            // ChatResponse object: { message: { role, content } }
            let content = '';
            if (response && typeof response === 'object') {
                // @ts-ignore
                if (response.message?.content) {
                    // @ts-ignore
                    content = response.message.content;
                } else {
                    content = JSON.stringify(response);
                }
            } else if (typeof response === 'string') {
                content = response;
            } else {
                content = 'Unexpected response format';
            }

            const aiMsg: Message = { role: 'assistant', content, timestamp: Date.now() };
            setMessages(prev => [...prev, aiMsg]);

            const dateStr = new Date().toISOString().split('T')[0];
            const logEntry = `\n[${new Date().toISOString()}] ${userMsg.role}: ${userMsg.content}\n[${new Date().toISOString()}] ${aiMsg.role}: ${content}\n`;
            puter.fs.write(`chat_history_${dateStr}.txt`, logEntry).catch(console.error);
        } catch (err) {
            console.error('Chat error:', err);
            const errorMsg: Message = { role: 'assistant', content: 'Sorry, I encountered an error processing your request.', timestamp: Date.now() };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white font-sans overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 opacity-50">
                        <div className="w-32 h-32 mb-6 relative">
                            <img src="/logo.svg" alt="ENTITY Logo" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]" />
                        </div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-2">ENTITY</h1>
                        <p className="text-lg text-gray-400">Your advanced AI companion</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[61.8%] p-6 rounded-2xl backdrop-blur-md shadow-xl ${msg.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30 text-white rounded-tr-sm' : 'bg-white/10 border border-white/10 text-gray-100 rounded-tl-sm'}`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            <p className="text-[10px] mt-2 opacity-40 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-sm flex gap-2 items-center">
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-8 pt-0 z-20">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-30 group-hover:opacity-70 transition duration-500 blur"></div>
                    <div className="relative flex items-center bg-gray-900 rounded-xl overflow-hidden border border-white/10">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            className="w-full bg-transparent border-none focus:ring-0 p-4 min-h-[60px] max-h-[200px] resize-none text-white placeholder-gray-500"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="p-4 text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors"
                        >
                            <svg className="w-6 h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-600 mt-3">AI can make mistakes. Consider checking important information.</p>
            </div>
        </div>
    );
}
