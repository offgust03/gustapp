import React from 'react';
import { StethoscopeIcon, ArrowLeftIcon } from './Icons';

interface HeaderProps {
  title: string;
  description: string;
  showBackButton: boolean;
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, description, showBackButton, onBack }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-4">
        {showBackButton && (
          <button 
            onClick={onBack} 
            aria-label="Voltar"
            className="text-slate-500 hover:text-indigo-600 transition-all duration-200 p-2 -ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:scale-95"
          >
            <ArrowLeftIcon />
          </button>
        )}
        <div className="bg-indigo-600 p-3 rounded-lg text-white shrink-0 shadow-sm">
          <StethoscopeIcon />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-600">{description}</p>
        </div>
      </div>
    </header>
  );
};

export default Header;