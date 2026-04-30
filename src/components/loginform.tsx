import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
  errors?: { email?: string; password?: string };
}

const LoginForm = ({ onSubmit, loading = false, errors = {} }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className={`h-14 px-5 rounded-xl bg-neutral-900/50 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all ${
            errors.email ? "border-destructive/50" : ""
          }`}
          required
        />
        {errors.email && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-destructive text-xs mt-2"
          >
            {errors.email}
          </motion.p>
        )}
      </div>

      <div>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`h-14 px-5 pr-14 rounded-xl bg-neutral-900/50 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all ${
              errors.password ? "border-destructive/50" : ""
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-destructive text-xs mt-2"
          >
            {errors.password}
          </motion.p>
        )}
      </div>

      <div className="flex justify-end">
        <button type="button" className="text-sm text-primary hover:text-primary/80 transition-colors">
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-14 rounded-xl text-base font-bold bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg shadow-primary/25 transition-all group"
      >
        {loading ? (
          <motion.div
            className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <span className="flex items-center gap-2">
            Sign In
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        )}
      </Button>
    </form>
  );
};

export default LoginForm;



