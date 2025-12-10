import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, hoverEffect = false }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-glass backdrop-blur-md border border-glassBorder shadow-lg rounded-2xl p-6
        transition-all duration-300
        ${hoverEffect ? 'hover:bg-white/40 hover:scale-[1.02] cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};