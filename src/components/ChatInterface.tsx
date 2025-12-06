'use client';

import { useState, useEffect, useRef } from 'react';
import { getPuter, Puter } from '@/lib/puter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Copy, Bot, User, ChevronDown, Check, Sparkles, RefreshCw } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

const MODELS = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    { id: 'mistral-large-latest', name: 'Mistral Large' }
];

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [puter, setPuter] = useState<Puter | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState(MODELS[0]);
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleSend = async () => {
        if (!input.trim() || !puter || loading) return;

        const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Reset textarea height
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        try {
            const response = await puter.ai.chat(userMsg.content, {
                model: selectedModel.id,
                stream: true
            });

            const aiMsg: Message = { role: 'assistant', content: '', timestamp: Date.now() };
            setMessages(prev => [...prev, aiMsg]);

            for await (const chunk of response) {
                const text = chunk?.text || chunk?.message?.content || chunk?.toString() || '';
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg.role === 'assistant') {
                        lastMsg.content += text;
                    }
                    return newMessages;
                });
            }

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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="flex flex-col h-screen w-full bg-[#0f1117] text-gray-100 font-sans overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f1117]/50 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 relative">
                        <img src="/logo.svg" alt="ENTITY" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">ENTITY</span>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-sm font-medium"
                    >
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        {selectedModel.name}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isModelMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isModelMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsModelMenuOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1d26] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                                {MODELS.map(model => (
                                    <button
                                        key={model.id}
                                        onClick={() => {
                                            setSelectedModel(model);
                                            setIsModelMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center justify-between group transition-colors"
                                    >
                                        <span className={`text-sm ${selectedModel.id === model.id ? 'text-blue-400 font-medium' : 'text-gray-300'}`}>
                                            {model.name}
                                        </span>
                                        {selectedModel.id === model.id && <Check className="w-4 h-4 text-blue-400" />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 relative mb-4">
                                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                                <img src="/logo.svg" alt="ENTITY" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">How can I help you today?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
                                {['Explain quantum computing', 'Write a python script for scraping', 'Creative writing ideas', 'Debug my code'].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => {
                                            setInput(suggestion);
                                        }}
                                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all text-left text-sm text-gray-300 hover:text-white"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                            )}

                            <div className={`relative max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? '' : 'w-full'}`}>
                                <div className={`px-5 py-4 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-sm shadow-blue-900/20 shadow-lg'
                                        : 'bg-[#1a1d26] text-gray-100 rounded-bl-sm border border-white/5 shadow-xl'
                                    }`}>
                                    {msg.role === 'assistant' ? (
                                        <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#0f1117] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    )}
                                </div>

                                {msg.role === 'assistant' && (
                                    <div className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <button
                                            onClick={() => copyToClipboard(msg.content)}
                                            className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-xs flex items-center gap-1"
                                            title="Copy to clipboard"
                                        >
                                            <Copy className="w-3 h-3" /> Copy
                                        </button>
                                    </div>
                                )}
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                                    <User className="w-5 h-5 text-gray-300" />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-[#1a1d26] px-5 py-4 rounded-2xl rounded-bl-sm border border-white/5 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-[#0f1117]/80 backdrop-blur-lg border-t border-white/5">
                <div className="max-w-3xl mx-auto relative">
                    <div className="relative flex items-end bg-[#1a1d26] rounded-xl border border-white/10 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all shadow-lg overflow-hidden">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Message ${selectedModel.name}...`}
                            className="w-full bg-transparent border-none focus:ring-0 p-4 min-h-[56px] max-h-[200px] resize-none text-white placeholder-gray-500 scrollbar-thin scrollbar-thumb-white/10"
                            rows={1}
                        />
                        <div className="p-2 pb-3 pr-3">
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className={`p-2 rounded-lg transition-all duration-200 ${input.trim() && !loading
                                        ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {loading ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <p className="text-center text-xs text-gray-600 mt-3">
                        ENTITY can make mistakes. Consider checking important information.
                    </p>
                </div>
            </div>
        </div>
    );
}
