import React from 'react';
import { Question } from '../data/carePathways';
import { GeneralPatient } from '../data/patientDatabase';
import TextInput from './question-types/TextInput';
import TextareaInput from './question-types/TextareaInput';
import YesNoInput from './question-types/YesNoInput';
import MultipleChoiceInput from './question-types/MultipleChoiceInput';
import DateInput from './question-types/DateInput';
import NumberInput from './question-types/NumberInput';

interface QuestionRendererProps {
  question: Question;
  value: string | number | readonly string[] | undefined;
  onChange: (value: string | number | readonly string[] | undefined) => void;
  onBlur?: () => void;
  disabled?: boolean;
  suggestions?: GeneralPatient[];
  onSuggestionSelect?: (patient: GeneralPatient) => void;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ 
  question, 
  value, 
  onChange, 
  onBlur, 
  disabled = false, 
  suggestions = [],
  onSuggestionSelect 
}) => {
  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return <TextInput question={question} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} suggestions={suggestions} onSuggestionSelect={onSuggestionSelect} />;
      case 'textarea':
        return <TextareaInput question={question} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} />;
      case 'yes-no':
        return <YesNoInput question={question} value={value} onChange={onChange} disabled={disabled} />;
      case 'multiple-choice':
        return <MultipleChoiceInput question={question} value={value} onChange={onChange} disabled={disabled} />;
      case 'date':
        return <DateInput question={question} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} />;
      case 'number':
        return <NumberInput question={question} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <label htmlFor={question.id} className={`block text-sm font-medium mb-1 ${disabled ? 'text-slate-400' : 'text-slate-700'}`}>
        {question.text}
      </label>
      {question.condition && <p className="text-xs text-slate-500 mb-2 italic">{question.condition}</p>}
      {renderInput()}
    </div>
  );
};

export default React.memo(QuestionRenderer);