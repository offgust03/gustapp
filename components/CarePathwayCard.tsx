import React from 'react';

interface CarePathwayCardProps {
  icon: React.FC;
  title: string;
  description: string;
  onClick: () => void;
}

const CarePathwayCard: React.FC<CarePathwayCardProps> = ({ icon: Icon, title, description, onClick }) => (
  <button
    className="w-full flex flex-col items-center bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    onClick={onClick}
    type="button"
  >
    <div className="mb-4">
      <Icon />
    </div>
    <h3 className="text-lg font-bold text-indigo-700 mb-2">{title}</h3>
    <p className="text-slate-600 text-center text-sm mb-2">{description}</p>
  </button>
);

export default CarePathwayCard;
