
import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ value, onChange, isLoading }) => {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-2 text-slate-800">1. Anotação Original</h2>
      <p className="text-sm text-slate-600 mb-4">
        Insira suas anotações da visita. Pode ser informal, com abreviações ou como preferir. A IA irá interpretar e reescrever.
      </p>
      <div className="flex-grow">
        <textarea
          value={value}
          onChange={onChange}
          disabled={isLoading}
          placeholder="Ex: fui na casa do sr. joão, ele disse q a pressão subiu e tava com dor de cabeça. a casa tava limpa. reforcei pra ele tomar o remédio..."
          className="w-full h-full min-h-[300px] p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none disabled:bg-slate-100/50"
        />
      </div>
    </div>
  );
};

export default TextInput;