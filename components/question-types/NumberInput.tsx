import React from 'react';
import { Question } from '../../data/carePathways';

interface NumberInputProps {
  question: Question;
  value: string | number | readonly string[] | undefined;
  onChange: (value: string | number | readonly string[] | undefined) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({ 
  question, 
  value, 
  onChange, 
  onBlur, 
  disabled = false, 
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      type="number"
      id={question.id}
      value={value}
      onChange={handleInputChange}
      onBlur={onBlur}
      placeholder={question.placeholder}
      disabled={disabled}
      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white disabled:bg-slate-100"
    />
  );
};

export default React.memo(NumberInput);
