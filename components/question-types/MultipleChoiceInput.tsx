import React from 'react';
import { Question } from '../../data/carePathways';

interface MultipleChoiceInputProps {
  question: Question;
  value: string | number | readonly string[] | undefined;
  onChange: (value: string | number | readonly string[] | undefined) => void;
  disabled?: boolean;
}

const MultipleChoiceInput: React.FC<MultipleChoiceInputProps> = ({ 
  question, 
  value, 
  onChange, 
  disabled = false, 
}) => {
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-x-6 gap-y-3 pt-2">
      {question.options?.map(option => (
        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name={question.id} 
            value={option.value} 
            checked={value === option.value} 
            onChange={handleRadioChange} 
            className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" 
            disabled={disabled} 
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default React.memo(MultipleChoiceInput);
