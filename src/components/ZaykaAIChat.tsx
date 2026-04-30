import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING_HOVER, SPRING_TAP, SPRING_ENTRY } from '@/motion/motionPresets';
import { Sparkles, Send, X, Bot, User, ChevronRight, Star, MapPin, Eye, EyeOff, Leaf } from 'lucide-react';
import { FoodCardProps } from '@/components/FoodCard';

interface ZaykaAIChatProps {
    foodData: any[]; // Aggregated list of all food items
}

interface Message {
    id: string;
    type: 'user' | 'ai';
    text: string;
    cards?: any[];
}

const ZaykaAIChat = ({ foodData }: ZaykaAIChatProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isQuietMode, setIsQuietMode] = useState(false);
    const [shownIds, setShownIds] = useState<Set<string>>(new Set()); // Memory for anti-repetition
    const [lastConstraints, setLastConstraints] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            type: 'ai',
            text: "Hi. I can help you decide what to eat. Tell me what you're dealing with—late night hunger, gym recovery, looking for a cheap bite, or just confused."
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

    const processQuery = (query: string) => {
        // ==========================================
        // 🔒 CORE LOGIC LOCKED
        // Changes allowed only for critical bug fixes.
        // Do not refactor or optimize further.
        // ==========================================
        const lowerQuery = query.toLowerCase();

        // INTERNAL LOGGING
        if (import.meta.env.DEV) {
            console.groupCollapsed(`Zayka AI Query: "${query}"`);
        }

        // --- 1. PARSE INPUT (STRICT) ---
        let budgetMax: number | null = null;
        let tasteConstraint: 'spicy' | 'sweet' | 'light' | 'protein' | null = null;
        let dietConstraint: 'veg' | 'non-veg' | null = null;
        let locationConstraint: string | null = null;
        let situation: string | null = null;

        // Strict Budget Parsing
        const budgetMatch = lowerQuery.match(/(?:under|below|max|upto|within)\s*(?:rs\.?|₹)?\s*(\d+)/) || lowerQuery.match(/(?:rs\.?|₹)\s*(\d+)/);
        if (budgetMatch) {
            budgetMax = parseInt(budgetMatch[1]);
        } else if (lowerQuery.includes('cheap') || lowerQuery.includes('budget')) {
            budgetMax = 150; // Hard cap for "cheap"
        }

        // Strict Taste/Goal Parsing
        if (['spicy', 'hot', 'teekha', 'masaledar'].some(k => lowerQuery.includes(k))) tasteConstraint = 'spicy';
        else if (['sweet', 'dessert', 'meetha', 'sugar'].some(k => lowerQuery.includes(k))) tasteConstraint = 'sweet';
        else if (['light', 'healthy', 'diet', 'low cal'].some(k => lowerQuery.includes(k))) tasteConstraint = 'light';
        else if (['protein', 'gym', 'workout', 'muscle'].some(k => lowerQuery.includes(k))) tasteConstraint = 'protein';

        // Strict Diet Parsing
        if ((['veg', 'vegetarian', 'pure veg'].some(k => lowerQuery.includes(k))) && !lowerQuery.includes('non')) dietConstraint = 'veg';
        else if (['non-veg', 'non veg', 'chicken', 'meat', 'egg', 'fish', 'mutton'].some(k => lowerQuery.includes(k))) dietConstraint = 'non-veg';

        // Location Parsing
        const availableAreas = Array.from(new Set(foodData.map(f => f.area.toLowerCase())));
        const foundArea = availableAreas.find(area => lowerQuery.includes(area));
        if (foundArea) locationConstraint = foundArea;

        // Situation Detection
        if (lowerQuery.includes('gym') || lowerQuery.includes('workout')) situation = 'post-workout';
        if (lowerQuery.includes('date')) situation = 'date night';
        if (lowerQuery.includes('party')) situation = 'party';

        // Session Reset Logic
        const currentConstraints = JSON.stringify({ budgetMax, tasteConstraint, dietConstraint, locationConstraint });
        if (currentConstraints !== lastConstraints) {
            setShownIds(new Set());
            setLastConstraints(currentConstraints);
            if (import.meta.env.DEV) console.log("Constraints changed. Resetting shownIds.");
        }

        if (import.meta.env.DEV) console.log("Constraints:", { budgetMax, tasteConstraint, dietConstraint, locationConstraint, situation });

        // --- 2. FILTERING LOGIC (STRICT ORDER) ---
        // Constraint consistency for this render
        const effectiveShownIds = (currentConstraints !== lastConstraints) ? new Set<string>() : shownIds;
        // Priority: Unshown items > Shown items (only if no unshown items match)
        let candidates = foodData.filter(item => !effectiveShownIds.has(item.id));
        let usedFallback = false;

        // Helper to apply filters
        const applyFilters = (items: any[]) => {
            let filtered = [...items];
            let failReason = "";

            // 1. Budget Filter
            if (budgetMax !== null) {
                const preCount = filtered.length;
                filtered = filtered.filter(f => {
                    const priceStart = parseInt(f.priceRange.split('-')[0]) || 0;
                    return priceStart <= budgetMax!;
                });
                if (filtered.length === 0 && preCount > 0) failReason = `budget (under ₹${budgetMax})`;
            }

            // 2. Taste/Goal Filter
            if (filtered.length > 0 && tasteConstraint) {
                const preCount = filtered.length;
                filtered = filtered.filter(f => {
                    const text = (f.name + " " + f.restaurant + " " + f.area).toLowerCase();

                    if (tasteConstraint === 'spicy') {
                        if (text.includes('ice cream') || text.includes('shake') || text.includes('cake') || text.includes('sweet')) return false;
                        return text.includes('spicy') || text.includes('mirch') || text.includes('masala') || text.includes('curry') || text.includes('jalapeno') || text.includes('schezwan') || text.includes('usal');
                    }
                    if (tasteConstraint === 'sweet') {
                        if (text.includes('spicy') || text.includes('chilli') || text.includes('masala')) return false;
                        return text.includes('cream') || text.includes('chocolate') || text.includes('shake') || text.includes('dessert') || text.includes('kulfi') || text.includes('sweet');
                    }
                    if (tasteConstraint === 'light') {
                        if (text.includes('fry') || text.includes('cheese') || text.includes('butter') || text.includes('burger') || text.includes('pizza') || text.includes('bhatura')) return false;
                        return text.includes('salad') || text.includes('soup') || text.includes('khichdi') || text.includes('idli') || text.includes('juice') || text.includes('tea') || text.includes('coffee');
                    }
                    if (tasteConstraint === 'protein') {
                        return text.includes('paneer') || text.includes('chicken') || text.includes('egg') || text.includes('soya') || text.includes('dal') || text.includes('tandoori');
                    }
                    return true;
                });
                if (filtered.length === 0 && preCount > 0) failReason = `taste (${tasteConstraint})`;
            }

            // 3. Diet Filter
            if (filtered.length > 0 && dietConstraint) {
                const preCount = filtered.length;
                filtered = filtered.filter(f => {
                    if (dietConstraint === 'veg') return f.isVeg;
                    if (dietConstraint === 'non-veg') return !f.isVeg || f.name.toLowerCase().includes('egg');
                    return true;
                });
                if (filtered.length === 0 && preCount > 0) failReason = `diet (${dietConstraint})`;
            }

            // 4. Location Filter
            if (filtered.length > 0 && locationConstraint) {
                const preCount = filtered.length;
                filtered = filtered.filter(f => f.area.toLowerCase().includes(locationConstraint!));
                if (filtered.length === 0 && preCount > 0) failReason = `location (${locationConstraint})`;
            }

            return { filtered, failReason };
        };

        // First pass: Try with unshown items
        let { filtered, failReason } = applyFilters(candidates);

        // If no matches, try fallback to ALL items (if user strictly wants something, better to repeat than show nothing)
        if (filtered.length === 0) {
            const result = applyFilters(foodData);
            if (result.filtered.length > 0) {
                filtered = result.filtered;
                usedFallback = true;
            } else {
                failReason = result.failReason; // Update failReason from broadly scoped search
            }
        }

        // --- 3. RESPONSE CONSTRUCTION ---

        // Handle Failure
        if (filtered.length === 0) {
            let errorMsg = "I couldn't find any food spots matching that combination.";
            if (failReason) {
                errorMsg = `I found options matching some criteria, but nothing fit your strict **${failReason}** constraint properly.`;
            }
            return {
                text: `${errorMsg}\n\nTry adjusting one filter (e.g., increasing budget or trying a different area).`,
                cards: []
            };
        }

        // Ranking (Rating > Relevance)
        // Simple sort by rating for now
        filtered.sort((a, b) => b.rating - a.rating);
        const recommendations = filtered.slice(0, 3); // Max 3 items

        // REGRESSION GUARDS
        if (import.meta.env.DEV) {
            if (recommendations.length > 3) console.error("GUARD FAIL: Max results exceeded");
            recommendations.forEach(r => {
                if (budgetMax) {
                    const price = parseInt(r.priceRange.split('-')[0]);
                    if (price > budgetMax) console.error(`GUARD FAIL: Budget exceeded for ${r.name} (${price} > ${budgetMax})`);
                }
                if (dietConstraint === 'veg' && !r.isVeg) console.error(`GUARD FAIL: Non-veg item suggested for veg constraint: ${r.name}`);
            });
            console.log("Recommendations generated:", recommendations.length);
            console.groupEnd();
        }

        let responseText = `Here are the top matches for you${usedFallback ? " (revisiting some favorites)" : ""}:\n\n`;

        recommendations.forEach(f => {
            // Generate Explanation
            const explanations: string[] = [];

            // Budget explanation
            if (budgetMax) {
                const priceVal = parseInt(f.priceRange.split('-')[0]);
                explanations.push(`Fits budget (~₹${priceVal})`);
            }

            // Taste/Goal explanation
            if (tasteConstraint) {
                if (tasteConstraint === 'protein') explanations.push("Protein-rich option");
                else if (tasteConstraint === 'light') explanations.push("Light & easy on stomach");
                else explanations.push(`Matches ${tasteConstraint} craving`);
            } else if (situation === 'post-workout' && (f.name.toLowerCase().includes('chicken') || f.name.toLowerCase().includes('paneer'))) {
                explanations.push("Good protein source");
            }

            // Location explanation
            if (locationConstraint) explanations.push(`Located in ${f.area}`);

            // Default
            if (explanations.length === 0) explanations.push(`Highly rated (${f.rating}⭐)`);

            const reason = explanations.join(" • ");

            responseText += `📍 **${f.name}** (${f.restaurant})\n💰 ${f.priceRange} • ${f.isVeg ? 'Veg' : 'Non-Veg'}\n💡 **Why:** ${reason}\n\n`;

            // Mark as shown
            setShownIds(prev => new Set(prev).add(f.id));
        });

        // Add context question
        if (filtered.length > 3) {
            responseText += "Check these out! Should I look for something else?";
        } else {
            responseText += "How does this look?";
        }

        return {
            text: responseText,
            cards: recommendations
        };
    };

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), type: 'user', text: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // Simulate thinking delay
        setTimeout(() => {
            const result = processQuery(userMsg.text);
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                text: result.text,
                cards: result.cards
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1000); // 1s delay for realism
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

                                        {/* Suggestion Cards */}
                                        {msg.cards && msg.cards.length > 0 && (
                                            <div className="space-y-2 mt-2 group/list">
                                                {/* DYNAMIC RENDERING: 1 card if Quiet, all if Normal */}
                                                {msg.cards.slice(0, isQuietMode ? 1 : undefined).map((card, idx) => (
                                                    isQuietMode ? (
                                                        // QUIET MODE CARD (Simplified, No Effects)
                                                        <div key={idx} className="bg-emerald-950/30 rounded-2xl p-4 border border-emerald-500/20 flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in duration-500">
                                                            <img src={card.image} alt={card.name} className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500/30 shadow-2xl" />
                                                            <div>
                                                                <h4 className="font-display font-medium text-lg text-emerald-100">{card.name}</h4>
                                                                <p className="text-xs text-emerald-400/60 uppercase tracking-widest">{card.restaurant}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-emerald-300/80">
                                                                <span>{card.rating} ⭐</span>
                                                                <span>•</span>
                                                                <span>{card.priceRange}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // NORMAL MODE CARD (Existing Mini-Card)
                                                        <div key={idx} className="bg-black/40 rounded-xl p-2 flex gap-3 border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                                                            <img src={card.image} alt={card.name} className="w-16 h-16 rounded-lg object-cover" />
                                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                                <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">{card.name}</h4>
                                                                <p className="text-xs text-muted-foreground truncate">{card.restaurant}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[10px] font-medium text-amber-500 flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-500" /> {card.rating}</span>
                                                                    <span className="text-[10px] text-muted-foreground">{card.priceRange}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                ))}

                                                {/* QUIET MODE TOGGLE FOOTER */}
                                                <div className="pt-2 flex justify-center">
                                                    <button
                                                        onClick={() => setIsQuietMode(!isQuietMode)}
                                                        className={`text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${isQuietMode ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                                                    >
                                                        {isQuietMode ? (
                                                            <>
                                                                <Eye className="w-3 h-3" /> Show All Options
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Leaf className="w-3 h-3" /> Quiet Mode
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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
                                    placeholder={isQuietMode ? "Ask simply..." : "Ask for spicy food, cheap eats..."}
                                    className={`w-full ${isQuietMode ? 'bg-emerald-950/20 border-emerald-500/10 focus:border-emerald-500/30' : 'bg-black/40 border-white/10 focus:border-primary/50'} rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none transition-colors placeholder:text-muted-foreground/50`}
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
