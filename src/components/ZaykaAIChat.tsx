import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING_HOVER, SPRING_TAP } from '@/motion/motionPresets';
import { Sparkles, Send, X, Bot, User, Star, ExternalLink, MapPin, ArrowRight } from 'lucide-react';
import { aiApi } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ZaykaAIChatProps {
    foodData?: any[];
}

interface AiCard {
    id: string;
    name: string;
    subtitle: string;
    image: string;
    rating: number | null;
    price?: string;
    type?: string;
    foodType?: string;
    isVeg?: boolean;
    whyRecommended?: string;
}

interface Message {
    id: string;
    type: 'user' | 'ai';
    text: string;
    cards?: AiCard[];
    parameters?: any;
}

const QUICK_SUGGESTIONS = [
    "🌶️ Spicy street food under ₹200",
    "🥘 Best Gujarati Thali in Alkapuri",
    "☕ Late night cozy cafe",
    "🌱 Pure veg snacks near Fatehgunj",
    "🍰 Authentic Vadodara sweets & desserts"
];

const ZaykaAIChat = ({ foodData }: ZaykaAIChatProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome-1',
            type: 'ai',
            text: "Kem Cho! I'm Zayka AI 2.0, your Vadodara food guru. Tell me your craving, budget, or favorite area, and I'll find the best places for you!"
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setTimeout(() => {
                inputRef.current?.focus();
            }, 150);
        }
    }, [messages, isOpen, isTyping]);

    const handleSend = async (textToSend?: string) => {
        const text = (textToSend || inputText).trim();
        if (!text) return;

        const userMsg: Message = {
            id: `user-${Date.now()}`,
            type: 'user',
            text: text
        };

        setMessages(prev => [...prev, userMsg]);
        if (!textToSend) setInputText('');
        setIsTyping(true);

        try {
            const res = await aiApi.chat(text);
            const reply = (res as any).reply as string | undefined;
            const cards = (res as any).cards as AiCard[] | undefined;
            const parameters = (res as any).parameters;
            if (res.success && reply) {
                const aiMsg: Message = {
                    id: `ai-${Date.now()}`,
                    type: 'ai',
                    text: reply,
                    cards: cards || [],
                    parameters
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                setMessages(prev => [
                    ...prev,
                    {
                        id: `ai-${Date.now()}`,
                        type: 'ai',
                        text: (res as any).error || "Hmm, I wasn't able to get a response right now. Please try again in a moment!"
                    }
                ]);
            }
        } catch {
            setMessages(prev => [
                ...prev,
                {
                    id: `ai-${Date.now()}`,
                    type: 'ai',
                    text: "Sorry, I'm having a little trouble connecting right now. Try again in a moment!"
                }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleCardClick = (card: AiCard) => {
        if (card.type === 'foodplace' && card.id) {
            navigate(`/place/${card.id}`);
            setIsOpen(false);
        } else if (card.name) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.name + ', Vadodara')}`, '_blank');
        }
    };

    return (
        <>
            {/* Main Chat Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[420px] h-[580px] max-h-[82vh] rounded-3xl bg-card/95 border border-white/15 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl overflow-x-hidden"
                    >
                        {/* 1. FIXED HEADER */}
                        <div className="shrink-0 p-3.5 sm:p-4 bg-gradient-to-r from-primary/20 via-orange-500/10 to-amber-500/20 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shrink-0">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="font-display font-bold text-sm sm:text-base text-foreground tracking-tight">Zayka AI 2.0</h3>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold border border-primary/30">
                                            RAG Powered
                                        </span>
                                    </div>
                                    <p className="text-[10px] sm:text-[11px] text-muted-foreground">Vadodara Culinary Intelligence</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Close Chat"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* 2. INDEPENDENTLY SCROLLABLE MESSAGES AREA */}
                        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3.5 sm:p-4 space-y-4 custom-scrollbar bg-black/25">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                                >
                                    {msg.type === 'ai' && (
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mr-2 mt-0.5 shrink-0 text-white shadow-sm">
                                            <Bot className="w-3.5 h-3.5" />
                                        </div>
                                    )}

                                    <div className={`space-y-2.5 ${msg.type === 'user' ? 'max-w-[78%]' : 'max-w-[88%]'}`}>
                                        <div
                                            className={`p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed break-words ${
                                                msg.type === 'user'
                                                    ? 'bg-gradient-to-r from-primary to-orange-500 text-white font-medium rounded-2xl rounded-tr-xs shadow-md ml-auto'
                                                    : 'bg-secondary/40 border border-white/10 text-foreground rounded-2xl rounded-tl-xs shadow-sm'
                                            }`}
                                        >
                                            {msg.type === 'ai' ? (
                                                <div className="zayka-markdown">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                msg.text
                                            )}
                                        </div>

                                        {/* Structured Recommendation Cards Carousel (Isolated Horizontal Scroll) */}
                                        {msg.cards && msg.cards.length > 0 && (
                                            <div className="w-full overflow-hidden">
                                                <div className="flex gap-2.5 overflow-x-auto overflow-y-hidden py-1.5 custom-scrollbar max-w-full -mx-1 px-1 scroll-smooth">
                                                    {msg.cards.map((card, idx) => (
                                                        <div
                                                            key={card.id || idx}
                                                            onClick={() => handleCardClick(card)}
                                                            className="w-44 sm:w-48 shrink-0 rounded-2xl bg-card/95 border border-white/15 overflow-hidden shadow-md hover:border-primary/50 cursor-pointer transition-all flex flex-col justify-between group hover:-translate-y-0.5"
                                                        >
                                                            {/* Card Image */}
                                                            <div className="relative h-24 w-full bg-black/50 overflow-hidden">
                                                                <img
                                                                    src={card.image || '/images/SevUsal.png'}
                                                                    alt={card.name}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).src = '/images/SevUsal.png';
                                                                    }}
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                                                {/* Rating Tag */}
                                                                {card.rating && (
                                                                    <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-amber-400 flex items-center gap-0.5 border border-white/10">
                                                                        <Star className="w-2.5 h-2.5 fill-amber-400" /> {card.rating}
                                                                    </span>
                                                                )}

                                                                {/* Price Tag */}
                                                                {card.price && (
                                                                    <span className="absolute top-1.5 right-1.5 text-[10px] font-bold bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-white border border-white/10">
                                                                        {card.price}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Card Info */}
                                                            <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1.5">
                                                                <div>
                                                                    <div className="flex items-center justify-between">
                                                                        <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate" title={card.name}>
                                                                            {card.name}
                                                                        </h4>
                                                                        <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary shrink-0 ml-1" />
                                                                    </div>
                                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                                                                        <MapPin className="w-2.5 h-2.5 text-primary shrink-0" />
                                                                        {card.subtitle}
                                                                    </p>
                                                                </div>

                                                                {/* Why Recommended Pill */}
                                                                {card.whyRecommended && (
                                                                    <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                                                                        <p className="text-[9.5px] text-primary font-medium line-clamp-2 leading-tight">
                                                                            💡 {card.whyRecommended}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {/* View Details Affordance */}
                                                                <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-primary font-bold">
                                                                    <span>View Details</span>
                                                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {msg.type === 'user' && (
                                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center ml-2 mt-0.5 shrink-0 text-primary-foreground shadow">
                                            <User className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Polished Thinking / Loading Indicator */}
                            {isTyping && (
                                <div className="flex items-center gap-2.5 text-muted-foreground text-xs ml-9 bg-card/80 border border-white/10 py-2 px-3.5 rounded-2xl w-fit shadow-sm animate-pulse">
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                                    </div>
                                    <span className="text-[11px] text-foreground/80 font-medium">Zayka AI is discovering recommendations...</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* 3. FIXED BOTTOM SECTION (Quick Suggestion Chips & Input) */}
                        <div className="shrink-0 border-t border-white/10 bg-card/95">
                            {/* Isolated Horizontal Scroll Suggestion Chips */}
                            <div className="px-3 py-2 bg-black/40 border-b border-white/5 flex gap-1.5 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth">
                                {QUICK_SUGGESTIONS.map((chip, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSend(chip)}
                                        className="shrink-0 text-[11px] px-3 py-1.5 rounded-full bg-white/5 hover:bg-primary/20 text-muted-foreground hover:text-foreground border border-white/10 hover:border-primary/40 transition-all font-medium whitespace-nowrap active:scale-95"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>

                            {/* Message Input Bar */}
                            <div className="p-3">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSend();
                                    }}
                                    className="relative flex items-center"
                                >
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Ask for spicy food, cafes, under ₹200..."
                                        className="w-full bg-black/50 border border-white/15 focus:border-primary/60 rounded-full pl-4 pr-12 py-2.5 text-xs sm:text-sm focus:outline-none transition-colors placeholder:text-muted-foreground/50 text-foreground"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputText.trim() || isTyping}
                                        className="absolute right-1.5 p-2 rounded-full bg-gradient-to-r from-primary to-orange-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all shadow-md active:scale-95"
                                        aria-label="Send message"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Responsive Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.06, transition: SPRING_HOVER }}
                whileTap={{ scale: 0.94, transition: SPRING_TAP }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 h-12 w-12 sm:h-auto sm:w-auto sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white font-bold shadow-2xl hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] border border-white/20 flex items-center justify-center gap-2 group cursor-pointer"
                title="Ask Zayka AI 2.0"
                aria-label="Open Zayka AI Assistant"
            >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform shrink-0" />
                <span className="hidden sm:inline text-xs font-bold tracking-wide">Ask Zayka AI 2.0</span>
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping border border-black" />
                )}
            </motion.button>
        </>
    );
};

export default ZaykaAIChat;
