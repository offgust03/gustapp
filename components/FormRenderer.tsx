import React from 'react';
import { Question, FormSection } from '../data/carePathways';
import { GeneralPatient } from '../data/patientDatabase';
import QuestionRenderer from './QuestionRenderer';
import { ArrowLeftIcon } from './Icons';

interface FormRendererProps {
  title: string;
  description: string;
  formSections: FormSection[];
  formData: Record<string, string | number | readonly string[] | undefined>;
  handleInputChange: (id: string, value: string | number | readonly string[] | undefined) => void;
  handleInputBlur: (id: string) => void;
  handleSave: (e: React.FormEvent) => void;
  handleGoBack: () => void;
  isSaving: boolean;
  searchResults: GeneralPatient[];
  handleSelectPatient: (patient: GeneralPatient) => void;
  patientDb: any;
  toastMessage: { type: 'success' | 'error', text: string } | null;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  title,
  description,
  formSections,
  formData,
  handleInputChange,
  handleInputBlur,
  handleSave,
  handleGoBack,
  isSaving,
  searchResults,
  handleSelectPatient,
  patientDb,
  toastMessage,
}) => {
  const getQuestionSpanClass = (question: Question): string => {
    return question.type === 'textarea' || question.span === 'full' ? 'md:col-span-2' : 'md:col-span-1';
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 relative">
      {toastMessage && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 py-2 px-5 rounded-full text-white text-sm font-semibold shadow-lg transition-all duration-300 z-50 ${
            toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toastMessage.text}
        </div>
      )}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
        <button
          onClick={handleGoBack}
          aria-label="Voltar"
          className="text-slate-500 hover:text-indigo-600 transition-colors p-2 -ml-2 rounded-full active:scale-95"
        >
          <ArrowLeftIcon />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-slate-600">{description}</p>
        </div>
      </div>

      <form className="space-y-8 mt-6" onSubmit={handleSave}>
        {formSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-slate-50/70 border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-indigo-700 mb-5 pb-3 border-b border-indigo-200/80">{section.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {section.questions.map((question: Question) => (
                <div key={question.id} className={`${getQuestionSpanClass(question)}`}>
                  <QuestionRenderer
                    question={question}
                    value={formData[question.id] || ''}
                    onChange={(val) => handleInputChange(question.id, val)}
                    onBlur={() => handleInputBlur(question.id)}
                    disabled={!patientDb && ['nome', 'cpf', 'cns'].includes(question.id)}
                    suggestions={question.id === 'nome' ? searchResults : []}
                    onSuggestionSelect={handleSelectPatient}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="mt-10 pt-6 border-t border-slate-200 text-center">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full max-w-xs bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-wait flex items-center justify-center gap-2 active:scale-95"
          >
            {isSaving ? 'Salvando...' : 'Salvar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormRenderer;
