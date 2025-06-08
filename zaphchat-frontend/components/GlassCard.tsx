
import React from 'react';

interface GlassCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ title, children, className = '', titleClassName = '', bodyClassName = '' }) => {
  return (
    <div 
      className={`bg-slate-800/65 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/60 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_30px_-5px_rgba(0,200,255,0.2)] ${className}`}
    >
      {title && (
        <div className={`px-6 py-5 border-b border-slate-700/50 ${titleClassName}`}>
          <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
