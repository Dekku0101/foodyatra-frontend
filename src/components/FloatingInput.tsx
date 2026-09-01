import { useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  rightElement?: React.ReactNode;
}

const FloatingInput = ({
  id,
  label,
  type = "text",
  icon: Icon,
  value,
  onChange,
  onFocus,
  onBlur,
  rightElement,
}: FloatingInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const isActive = isFocused || hasValue;

  return (
    <motion.div
      className="relative"
      initial={false}
      animate={{
        scale: isFocused ? 1.02 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`
          relative flex items-center gap-3 px-4 
          bg-input/50 border rounded-xl
          transition-all duration-300
          ${isFocused 
            ? "border-primary/50 ring-2 ring-primary/20 bg-input/80 shadow-lg shadow-primary/10" 
            : "border-border/50 hover:border-border"
          }
        `}
      >
        <Icon 
          size={20} 
          className={`
            transition-colors duration-300 flex-shrink-0
            ${isFocused ? "text-primary" : "text-muted-foreground"}
          `}
        />
        
        <div className="relative flex-1 min-h-[56px] py-2">
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            className="
              w-full h-full bg-transparent text-foreground outline-none
              placeholder-transparent peer
              pt-5 pb-1
              transition-all duration-300
            "
            placeholder=" "
          />
          
          <label
            htmlFor={id}
            className={`
              absolute left-0 pointer-events-none
              transition-all duration-300 ease-out
              origin-left
              ${isActive 
                ? "top-1 text-xs scale-90 text-primary font-medium" 
                : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
              }
            `}
          >
            {label}
          </label>
        </div>

        {rightElement && (
          <div className="flex-shrink-0">
            {rightElement}
          </div>
        )}
      </div>

      {/* Glow effect on focus */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isFocused ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 -z-10 bg-primary/5 rounded-xl blur-xl"
      />
    </motion.div>
  );
};

export default FloatingInput;
