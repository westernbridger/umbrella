
import React from 'react';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({ children, variant = 'primary', icon, className = '', ...props }) => {
  const baseStyles = "px-6 py-3 rounded-xl font-semibold text-base tracking-wide shadow-lg transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-4";
  const primaryStyles = "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white focus:ring-cyan-400/50 hover:shadow-[0_0_20px_0px_rgba(72,187,255,0.5)] active:scale-95";
  const secondaryStyles = "bg-slate-700/80 hover:bg-slate-600/80 text-slate-100 border border-slate-600 focus:ring-slate-500/50 hover:shadow-[0_0_15px_0px_rgba(100,116,139,0.4)] active:scale-95";

  const styles = variant === 'primary' ? primaryStyles : secondaryStyles;

  return (
    <button
      className={`${baseStyles} ${styles} ${icon ? 'flex items-center justify-center space-x-2' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="inline-block">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default PremiumButton;
