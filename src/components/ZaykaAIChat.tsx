import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING_HOVER, SPRING_TAP } from '@/motion/motionPresets';
import { Sparkles, Send, X, Bot, User } from 'lucide-react';
import { aiApi } from '@/lib/api';

interface ZaykaAIChatProps {
    foodData?: any[]; // Kept for backwards compatibility but unused
}

interface Message {
    id: string;
    type: 'user' | 'ai';
    text: string;
    cards?: any[];
}

const ZaykaAIChat = ({ foodData }: ZaykaAIChatProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            type: 'ai',
            text: "Hi. I am Zayka AI. Ask me about food in Vadodara, comfort food recommendations, or anything else!"
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, isOpen]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), type: 'user', text: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            const res = await aiApi.chat(userMsg.text);
            const replyText = res.success && (res as any).reply 
                ? (res as any).reply 
                : (res.error || "Sorry, I'm having trouble thinking right now.");
                
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                text: replyText
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                text: "An error occurred while connecting to my brain."
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-4 z-50 w-[350px] md:w-[400px] h-[500px] glass-card flex flex-col shadow-2xl overflow-hidden border border-primary/20"
                    >
                        {/* Header */}
                        <div className="p-4 bg-primary/10 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-sm">Zayka AI</h3>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.type === 'ai' && (
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-1 shrink-0">
                                            <Bot className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                    )}
                                    <div className="max-w-[85%] space-y-2">
                                        <div
                                            className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.type === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                                : 'bg-white/10 text-foreground rounded-bl-none border border-white/5'
                                                }`}
                                        >
                                            <div className="whitespace-pre-wrap">{msg.text}</div>
                                        </div>


                                    </div>
                                    {msg.type === 'user' && (
                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center ml-2 mt-1 shrink-0">
                                            <User className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex items-center gap-2 text-muted-foreground text-xs ml-8">
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-card/50 border-t border-white/10">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask for spicy food, cheap eats..."
                                    className="w-full bg-black/40 border-white/10 focus:border-primary/50 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputText.trim()}
                                    className="absolute right-1.5 p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all shadow-lg"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.05, transition: SPRING_HOVER }}
                whileTap={{ scale: 0.95, transition: SPRING_TAP }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 z-50 px-5 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold shadow-premium hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] border border-white/20 flex items-center gap-2 group"
            >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="hidden md:inline">Ask Zayka AI</span>
                {/* Notification Dot */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-black" />
                )}
            </motion.button>
        </>
    );
};

export default ZaykaAIChat;
