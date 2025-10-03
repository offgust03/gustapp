import React, { useState, useCallback } from 'react';
import { rewriteText } from '../services/geminiService';
import OutputDisplay from '../components/OutputDisplay';
import { WandIcon, DocumentIcon, UserIcon, TrashIcon } from '../components/Icons';
import { RewriteTarget } from '../App';
import Loader from '../components/Loader';

const RewriteScreen: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [rewrittenText, setRewrittenText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rewriteTarget, setRewriteTarget] = useState<RewriteTarget>('record');

  const handleRewrite = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Por favor, insira um texto para ser reescrito.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRewrittenText('');
    try {
      const result = await rewriteText(inputText, rewriteTarget);
      setRewrittenText(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Ocorreu um erro: ${err.message}. Verifique sua chave de API e tente novamente.`);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, rewriteTarget]);

  const handleClear = () => {
    setInputText('');
    setRewrittenText('');
    setError(null);
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-semibold mb-2 text-slate-900">1. Texto Original</h2>
        <p className="text-sm text-slate-600 mb-4">
          Cole o texto que você deseja reescrever no campo abaixo.
        </p>
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Ex: Paciente refere dor abdominal há 3 dias, com piora progressiva. Nega febre ou vômitos. Ao exame, abdome doloroso à palpação em fossa ilíaca direita."
            className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-y disabled:bg-slate-100"
          />
          {inputText && (
            <button
              onClick={handleClear}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Limpar texto"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>

      {/* Target Audience Section */}
      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-slate-900">2. Objetivo do Texto</h2>
        <p className="text-sm text-slate-600 mt-1 mb-6">
          Selecione para quem o texto se destina. Isso ajustará o tom e a complexidade.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setRewriteTarget('record')}
            className={`w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 text-sm font-bold rounded-lg transition-all duration-200 border-2 active:scale-95 ${
              rewriteTarget === 'record'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-500 hover:bg-indigo-50'
            }`}
          >
            <DocumentIcon />
            <span>Para o Prontuário</span>
          </button>
          <button
            onClick={() => setRewriteTarget('patient')}
            className={`w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 text-sm font-bold rounded-lg transition-all duration-200 border-2 active:scale-95 ${
              rewriteTarget === 'patient'
                ? 'bg-green-600 text-white border-green-600 shadow-lg'
                : 'bg-white text-slate-700 border-slate-300 hover:border-green-500 hover:bg-green-50'
            }`}
          >
            <UserIcon />
            <span>Para o Paciente</span>
          </button>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center py-4">
        <button
          onClick={handleRewrite}
          disabled={isLoading || !inputText}
          className="w-full max-w-sm flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <WandIcon />
          Reescrever Texto
        </button>
      </div>

      {/* Results Section */}
      {(isLoading || error || rewrittenText) && (
        <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold mb-6 text-slate-900">3. Texto Reescrito</h2>
          {isLoading && <Loader />}
          {error && <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>}
          {!isLoading && !error && rewrittenText && (
            <OutputDisplay
              text={rewrittenText}
              isLoading={false}
              error={null}
              rewriteTarget={rewriteTarget}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default RewriteScreen;
