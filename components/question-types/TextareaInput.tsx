import React from 'react';
import { Question } from '../../data/carePathways';

interface TextareaInputProps {
  question: Question;
  value: string | number | readonly string[] | undefined;
  onChange: (value: string | number | readonly string[] | undefined) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

const TextareaInput: React.FC<TextareaInputProps> = ({ 
  question, 
  value, 
  onChange, 
  onBlur, 
  disabled = false, 
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <textarea
      id={question.id}
      value={value}
      onChange={handleInputChange}
      onBlur={onBlur}
      placeholder={question.placeholder || 'Digite aqui...'}
      rows={4}
      disabled={disabled}
      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white resize-y disabled:bg-slate-100"
    />
  );
};

export default React.memo(TextareaInput);
