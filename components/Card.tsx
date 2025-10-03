import React from 'react';
import { ArrowRightIcon } from './Icons';

interface CardProps {
  icon: React.FC;
  title: string;
  description: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ icon: Icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-lg rounded-xl p-6 text-left transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-full active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <div className="bg-indigo-100 text-indigo-600 rounded-lg p-3 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white">
          <Icon />
        </div>
        <ArrowRightIcon />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mt-4">{title}</h3>
      <p className="text-slate-600 text-sm mt-1">{description}</p>
    </button>
  );
};

export default Card;