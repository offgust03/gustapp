import React from 'react';
import { Question } from '../../data/carePathways';

interface YesNoInputProps {
  question: Question;
  value: string | number | readonly string[] | undefined;
  onChange: (value: string | number | readonly string[] | undefined) => void;
  disabled?: boolean;
}

const YesNoInput: React.FC<YesNoInputProps> = ({ 
  question, 
  value, 
  onChange, 
  disabled = false, 
}) => {
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex items-center gap-6 pt-2">
      <label className="flex items-center gap-2 cursor-pointer">
        <input 
          type="radio" 
          name={question.id} 
          value="sim" 
          checked={value === 'sim'} 
          onChange={handleRadioChange} 
          className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" 
          disabled={disabled}
        />
        <span>Sim</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input 
          type="radio" 
          name={question.id} 
          value="nao" 
          checked={value === 'nao'} 
          onChange={handleRadioChange} 
          className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" 
          disabled={disabled}
        />
        <span>Não</span>
      </label>
    </div>
  );
};

export default React.memo(YesNoInput);
