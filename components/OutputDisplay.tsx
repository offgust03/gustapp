import React, { useState, useEffect } from 'react';
import { ClipboardIcon, ClipboardCheckIcon, WhatsAppIcon } from './Icons';
import Loader from './Loader';
import { RewriteTarget } from '../App';

interface OutputDisplayProps {
  text: string;
  isLoading: boolean;
  error: string | null;
  rewriteTarget: RewriteTarget;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ text, isLoading, error, rewriteTarget }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
    }
  };
  
  const handleSendWhatsApp = () => {
    if (text) {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    if (isLoading || error || !text) {
      setCopied(false);
    }
  }, [isLoading, error, text]);
  
  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }
    if (error) {
      return <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>;
    }
    if (text) {
      return <div className="whitespace-pre-wrap p-4">{text}</div>;
    }
    return (
      <div className="text-center text-slate-400 p-4">
        O texto reescrito profissionalmente aparecerá aqui.
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-slate-800">2. Texto Profissional (IA)</h2>
      </div>
       <p className="text-sm text-slate-600 mb-4">
        Este é o texto formatado pela IA, pronto para ser copiado para o prontuário ou enviado ao paciente.
      </p>
      <div className="flex-grow w-full h-full min-h-[300px] p-4 bg-slate-100 border border-slate-200 rounded-lg relative overflow-y-auto">
        {renderContent()}
      </div>
      
      {text && !isLoading && !error && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {rewriteTarget === 'record' && (
              <button
                onClick={handleCopy}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-100 text-indigo-700 font-bold py-2 px-6 rounded-lg hover:bg-indigo-200 transition-all duration-200 active:scale-95"
              >
                {copied ? <ClipboardCheckIcon /> : <ClipboardIcon />}
                {copied ? "Copiado!" : "Copiar para Prontuário"}
              </button>
            )}
            {rewriteTarget === 'patient' && (
              <button
                onClick={handleSendWhatsApp}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-all duration-200 active:scale-95"
              >
                <WhatsAppIcon />
                Enviar via WhatsApp
              </button>
            )}
        </div>
      )}
    </div>
  );
};

export default OutputDisplay;