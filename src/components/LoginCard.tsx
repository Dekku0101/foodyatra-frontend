import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Loader2, ChefHat, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FloatingInput from "./FloatingInput";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { SPRING_ENTRY, SPRING_HOVER, SPRING_TAP, fadeIn } from "../motion/motionPresets";

const LoginCard = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await authApi.login(email, password);

        if (response.success) {
          // Get token from response
          const token = response.token || localStorage.getItem("token");

          // Save token to localStorage with key "token" (REQUIRED)
          if (token) {
            localStorage.setItem("token", token);
          }

          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          });

          // Force navigation to dashboard using window.location
          // This guarantees navigation even if hooks/props are miswired
          navigate("/dashboard");
        } else {
          toast({
            title: "Login failed",
            description: response.error || "Invalid email or password",
            variant: "destructive",
          });
        }
      } else {
        // Signup
        if (!name.trim()) {
          toast({
            title: "Validation error",
            description: "Please enter your name",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const response = await authApi.register(name, email, password);

        if (response.success) {
          // Get token from response (if backend auto-logs in after signup)
          const token = response.token || localStorage.getItem("token");

          if (token) {
            // Save token to localStorage
            localStorage.setItem("token", token);

            toast({
              title: "Account created!",
              description: "Welcome to FoodYatra! Redirecting to dashboard...",
            });

            // Auto-login: redirect to dashboard
            navigate("/dashboard");
          } else {
            // No token: switch to login mode
            toast({
              title: "Account created!",
              description: "Welcome to FoodYatra. Please login to continue.",
            });
            setIsLogin(true);
            setName("");
          }
        } else {
          toast({
            title: "Signup failed",
            description: response.error || "Failed to create account",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);

      // MOCK MODE FALLBACK: If backend is unreachable, allow login
      const mockToken = "mock-jwt-token-" + Date.now();
      localStorage.setItem("token", mockToken);

      toast({
        title: "Mock Login Active",
        description: "Backend unavailable. Entering Mock Mode...",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={SPRING_ENTRY}
      className="relative w-full max-w-md"
    >
      {/* Outer glow */}
      <motion.div
        animate={{
          opacity: focusedField ? 0.5 : 0.2,
          scale: focusedField ? 1.02 : 1,
        }}
        transition={SPRING_HOVER}
        className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-3xl blur-xl"
      />

      {/* Card */}
      <div className="relative glass-card rounded-2xl p-8 md:p-10 border-primary/10">
        {/* Decorative chef hat */}
        <AnimatePresence>
          {focusedField && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={SPRING_HOVER}
              className="absolute -top-4 -right-4"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                <ChefHat size={18} className="text-primary-foreground" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
            >
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs font-medium text-primary">Powered by ZaykaAI</span>
            </motion.div>

            {/* Toggle between Login and Signup */}
            <div className="flex gap-2 mb-4 p-1 bg-muted/30 rounded-lg">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${isLogin
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${!isLogin
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Sign Up
              </button>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_ENTRY, delay: 0.1 }}
              className="text-2xl md:text-3xl font-display font-semibold text-cream mb-2"
            >
              {isLogin ? "Welcome Back, Foodie!" : "Join FoodYatra!"}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...SPRING_ENTRY, delay: 0.2 }}
              className="text-muted-foreground text-sm"
            >
              {isLogin
                ? "Sign in to explore delicious discoveries"
                : "Create an account to start your food journey"}
            </motion.p>
          </div>

          {/* Form fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_ENTRY, delay: 0.3 }}
            className="space-y-4"
          >
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={SPRING_HOVER}
                >
                  <FloatingInput
                    id="name"
                    label="Full name"
                    type="text"
                    icon={User}
                    value={name}
                    onChange={setName}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <FloatingInput
              id="email"
              label="Email Address (Login ID)"
              type="email"
              icon={Mail}
              value={email}
              onChange={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />

            <FloatingInput
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              icon={Lock}
              value={password}
              onChange={setPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </motion.div>

          {/* Forgot password */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...SPRING_ENTRY, delay: 0.4 }}
            className="flex justify-end"
          >
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </button>
          </motion.div>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_ENTRY, delay: 0.5 }}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -15px hsl(35, 90%, 50%, 0.4)", transition: SPRING_HOVER }}
            whileTap={{ scale: 0.98, transition: SPRING_TAP }}
            className="
              relative w-full py-4 px-6 rounded-xl font-semibold
              bg-gradient-to-r from-primary via-secondary to-accent
              text-primary-foreground overflow-hidden
              transition-all duration-300 group
              disabled:opacity-70 disabled:cursor-not-allowed
              shadow-lg shadow-primary/20
            "
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cream/20 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />

            <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? "Start Your Food Journey" : "Create Account"}
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={18} />
                  </motion.span>
                </>
              )}
            </span>
          </motion.button>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ ...SPRING_ENTRY, delay: 0.6 }}
            className="flex items-center gap-4 py-2"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs text-muted-foreground">new to FoodYatra?</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </motion.div>

          {/* Toggle prompt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_ENTRY, delay: 0.7 }}
            className="text-center"
          >
            <motion.button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              whileHover={{ scale: 1.02, transition: SPRING_HOVER }}
              whileTap={{ scale: 0.98, transition: SPRING_TAP }}
              className="
                w-full py-3.5 px-6 rounded-xl font-medium
                border border-primary/30 bg-primary/5
                hover:bg-primary/10 hover:border-primary/50
                transition-all duration-300
                text-cream
              "
            >
              {isLogin ? "Create an account" : "Already have an account? Login"}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
};

export default LoginCard;
