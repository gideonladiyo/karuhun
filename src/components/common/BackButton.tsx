import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  onClick: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  label = 'BACK TO GUILD',
  onClick,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] hover:border-white text-white font-heading font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-[0.98] group ${className}`}
    >
      <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:-translate-x-0.5 transition-transform" />
      <span>{label}</span>
    </button>
  );
};
