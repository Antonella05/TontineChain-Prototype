import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { ReactNode } from 'react';

interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  className?: string;
}

export function ActionButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled, 
  className 
}: ActionButtonProps) {
  const baseStyles = "relative flex items-center justify-center py-4 px-6 rounded-xl font-display font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white shadow-lg shadow-primary/20",
    outline: "border-2 border-forest text-text-main hover:bg-forest/10",
    ghost: "text-text-muted hover:text-text-main hover:bg-bg-card/50",
    danger: "bg-danger text-white shadow-lg shadow-danger/20",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], className)}
    >
      {children}
    </motion.button>
  );
}

export function ProgressBar({ progress, className }: { progress: number, className?: string }) {
  return (
    <div className={cn("h-2 w-full bg-white/10 rounded-full overflow-hidden", className)}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full bg-primary"
      />
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'en-cours': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'complet': 'bg-forest/20 text-forest border-forest/30',
    'alerte': 'bg-danger/20 text-danger border-danger/30',
    'payé': 'bg-forest/20 text-forest border-forest/30',
    'en retard': 'bg-danger/20 text-danger border-danger/30',
    'en attente': 'bg-primary/20 text-primary border-primary/30',
    'libéré': 'bg-forest/20 text-green-400 border-forest/30',
  };

  return (
    <div className={cn(
      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      styles[status.toLowerCase()] || styles['en-cours']
    )}>
      {status}
    </div>
  );
}

export function Toast({ message, visible }: { message: string, visible: boolean }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: visible ? 0 : 100, opacity: visible ? 1 : 0 }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-2xl z-50 pointer-events-none"
    >
      <p className="text-primary font-medium text-sm">{message}</p>
    </motion.div>
  );
}
