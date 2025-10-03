import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { populateTemplate } from '../services/geminiService';
import { PlusIcon, TrashIcon, WandIcon, WhatsAppIcon, ClipboardIcon, ClipboardCheckIcon, UploadIcon, CameraIcon } from '../components/Icons';
import Loader from '../components/Loader';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.mjs';

interface Template {
  id: number;
  name: string;
  content: string;
}

interface GeneratedResult {
  templateName: string;
  text: string;
}

const ExtractorScreen: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 1,
      name: 'AVISO SISREG',
      content: "Olá, XXXXXX! Como vai? Sou Gustavo, Agente Comunitário(a) de Saúde do CMS Newton Alves Cardozo. Entro em contato para informar que foi agendado o(a) procedimento/consulta XXXXXX via SISREG, em nome de XXXXXX em XXXXXX, às XXXXXX, na unidade XXXXXX.\n\nEndereço da unidade executante: XXXXXX, XXXX - XXXXXX\n\nEm breve, será entregue em seu endereço, a guia de encaminhamento necessária para que ocorra o atendimento descrito acima. Tal documento também fica disponível para retirada em nossa unidade, caso assim preferir.",
    },
    {
      id: 2,
      name: 'VD AVISO SISREG',
      content: "Registro de contato realizado via WhatsApp, a fim de informar a XXXXXX que foi agendado(a) via SISREG, o(a) procedimento/consulta XXXXXX, sendo data e horário do agendamento XXX ● XXXXXX ● XXhXXmin; e que em breve será entregue em seu endereço, a guia de encaminhamento necessária para realização do(a) procedimento/consulta. Durante o contato, não me foram apresentadas quaisquer queixas ou solicitações.",
    },
    {
      id: 3,
      name: 'VD ENTREGA SISREG',
      content: "Visita domiciliar realizada a fim de entregar a XXXXXX, guia de encaminhamento para a(o) consulta/procedimento XXXXXX, agendado(a) via SISREG, para o dia XXXXXX, às XXXXXX, e cujo código de solicitação é XXXXXX. Durante a visita não me foram apresentadas quaisquer queixas ou solicitações. Segundo XXXXXX, seus familiares estão relativamente bem, e não precisam de nosso auxílio para questões além das que estão sendo tratadas no momento.",
    },
  ]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(templates[0]?.id ?? null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);


  const [generatedResults, setGeneratedResults] = useState<GeneratedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFileParsing, setIsFileParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const selected = templates.find(t => t.id === selectedTemplateId);
    setEditingTemplate(selected ? { ...selected } : null);
  }, [selectedTemplateId, templates]);
  
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);
  
  const openCamera = useCallback(async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
        }
        setIsCameraOpen(true);
    } catch (err) {
        console.error("Erro ao acessar a câmera:", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
    }
  }, []);

  const closeCamera = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  }, []);

  const handleCapture = useCallback(() => {
    if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setSourceImage(dataUrl);
            closeCamera();
        }
    }
  }, [closeCamera]);


  const handleAddTemplate = () => {
    const newTemplate: Template = {
      id: Date.now(),
      name: 'Novo Modelo',
      content: 'Exemplo de texto com o marcador XXXXXX.',
    };
    setTemplates([...templates, newTemplate]);
    setSelectedTemplateId(newTemplate.id);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
       if (!editingTemplate.name.trim() || !editingTemplate.content.trim()) {
        setToastMessage({ type: 'error', text: 'O nome e o conteúdo do modelo não podem estar vazios.' });
        return;
      }
      setTemplates(templates.map(t => (t.id === editingTemplate.id ? editingTemplate : t)));
      setToastMessage({ type: 'success', text: `Modelo '${editingTemplate.name}' salvo com sucesso!` });
    }
  };

  const handleRemoveTemplate = () => {
    if (editingTemplate && window.confirm(`Tem certeza que deseja remover o modelo "${editingTemplate.name}"?`)) {
        const newTemplates = templates.filter(t => t.id !== editingTemplate.id);
        setTemplates(newTemplates);
        setSelectedTemplateId(newTemplates[0]?.id ?? null);
    }
  };

  const handleTemplateEdit = (field: keyof Omit<Template, 'id'>, value: string) => {
    if (editingTemplate) {
      setEditingTemplate({ ...editingTemplate, [field]: value });
    }
  };

  const handleExtractAndGenerate = useCallback(async () => {
    if (!sourceText.trim() && !sourceImage) {
      setError('Por favor, insira o conteúdo fonte (texto ou imagem) para extrair os dados.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedResults([]);

    try {
       if (templates.length === 0) {
        setError("Não há modelos para preencher. Crie um modelo primeiro.");
        setIsLoading(false);
        return;
      }
      
      let sourceImageForApi: { mimeType: string; data: string } | null = null;
      if (sourceImage) {
          const parts = sourceImage.split(',');
          const mimeType = parts[0].match(/:(.*?);/)?.[1];
          const base64Data = parts[1];
          if (mimeType && base64Data) {
              sourceImageForApi = { mimeType, data: base64Data };
          }
      }

      const resultsPromises = templates.map(async (template) => {
        const populatedContent = await populateTemplate(sourceText, template.content, sourceImageForApi);
        return {
          templateName: template.name,
          text: populatedContent,
        };
      });

      const results = await Promise.all(resultsPromises);
      setGeneratedResults(results);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Ocorreu um erro: ${err.message}.`);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, templates, sourceImage]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendWhatsApp = (text: string) => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };
  
  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    setError(null);
    setSourceText('');
    setSourceImage(null);

    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const text = loadEvent.target?.result;
        if (typeof text === 'string') {
          setSourceText(text);
        }
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
      setIsFileParsing(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => (item as any).str).join(' ') + '\n';
        }
        setSourceText(fullText);
      } catch (pdfError) {
        console.error("Error parsing PDF:", pdfError);
        setError('Não foi possível ler o arquivo PDF. Ele pode estar corrompido ou protegido.');
      } finally {
        setIsFileParsing(false);
      }
    } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const result = loadEvent.target?.result;
            if (typeof result === 'string') {
                setSourceImage(result);
            }
        };
        reader.readAsDataURL(file);
    } else {
      setError('Por favor, selecione um arquivo .txt, .pdf ou .jpg.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
        handleFileChange(files[0]);
    }
    e.target.value = '';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) handleFileChange(files[0]);
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-semibold mb-2 text-slate-900">1. Conteúdo Fonte</h2>
        <p className="text-sm text-slate-600 mb-4">
          {sourceImage
            ? 'Imagem carregada. Adicione um texto de contexto abaixo ou deixe em branco.'
            : 'Cole o conteúdo, selecione um arquivo (.txt/.pdf/.jpg) ou use a câmera.'}
        </p>

        {sourceImage && (
            <div className="mb-4 relative group">
                <img src={sourceImage} alt="Pré-visualização da fonte" className="rounded-lg max-h-80 w-auto mx-auto shadow-md" />
                <button
                    onClick={() => setSourceImage(null)}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition-opacity duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Remover imagem"
                >
                    <TrashIcon />
                </button>
            </div>
        )}

        <div
          onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
          onDragOver={handleDragOver} onDrop={handleDrop}
          className={`relative transition-colors duration-200 ${isDragging ? 'bg-indigo-50' : ''}`}
        >
          <div className={`absolute inset-0 border-2 border-dashed rounded-lg transition-all duration-200 pointer-events-none ${isDragging ? 'border-indigo-500 scale-100 opacity-100' : 'border-slate-300 scale-95 opacity-0'}`}></div>
           {(isDragging || isFileParsing) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-95 z-10 pointer-events-none rounded-lg">
              {isFileParsing ? (
                <>
                  <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="font-semibold text-indigo-600">Lendo PDF...</p>
                </>
              ) : (
                <>
                  <UploadIcon />
                  <p className="font-semibold text-indigo-600">Solte o arquivo aqui</p>
                </>
              )}
            </div>
          )}
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            disabled={isLoading || isFileParsing}
            placeholder={sourceImage ? "Contexto adicional (opcional): Descreva o que a IA deve procurar na imagem..." : "Ex: Cliente: João da Silva, Produto: Plano de Saúde Plus, Valor: R$299,90, Data de agendamento: 15/08/2024, Contato: (11) 99999-8888"}
            className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-y disabled:bg-slate-100 relative bg-white"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
            <input type="file" ref={fileInputRef} onChange={onFileInputChange} accept=".txt,.pdf,.jpg,.jpeg" className="hidden" />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isFileParsing}
                className="flex items-center justify-center gap-2 bg-white text-slate-700 font-bold py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 transition-all duration-200 disabled:opacity-50 active:scale-95"
            >
                <UploadIcon className="h-5 w-5 text-slate-600" />
                Selecionar Arquivo
            </button>
            <button
                onClick={openCamera}
                disabled={isLoading || isFileParsing}
                className="flex items-center justify-center gap-2 bg-white text-slate-700 font-bold py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 transition-all duration-200 disabled:opacity-50 active:scale-95"
            >
                <CameraIcon className="h-5 w-5 text-slate-600" />
                Usar Câmera
            </button>
        </div>
      </div>

      {/* Templates Section */}
      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 relative">
        {toastMessage && (
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 mt-4 py-2 px-4 rounded-lg text-white text-sm shadow-lg transition-all duration-300 ${toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                {toastMessage.text}
            </div>
        )}
        <h2 className="text-2xl font-semibold text-slate-900">2. Modelos de Texto</h2>
        <p className="text-sm text-slate-600 mt-1 mb-6">
          Crie e gerencie seus modelos. Use <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded-md text-xs">XXXXXX</code> para os dados que a IA deve preencher.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-grow">
            <label htmlFor="template-select" className="block text-sm font-medium text-slate-600 mb-1">Modelo Selecionado</label>
            <select
                id="template-select"
                value={selectedTemplateId ?? ''}
                onChange={e => setSelectedTemplateId(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddTemplate}
            className="flex self-end items-center justify-center gap-2 bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-all duration-200 active:scale-95"
          >
            <PlusIcon />
            Criar Novo Modelo
          </button>
        </div>

        {editingTemplate ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                <div>
                  <label htmlFor="template-name" className="block text-sm font-medium text-slate-600 mb-1">Nome do Modelo</label>
                  <input
                    id="template-name" type="text" value={editingTemplate.name}
                    onChange={e => handleTemplateEdit('name', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="template-content" className="block text-sm font-medium text-slate-600">Conteúdo do Modelo</label>
                      <button
                        onClick={() => handleTemplateEdit('content', '')}
                        type="button"
                        className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                      >
                        Limpar Campo
                      </button>
                    </div>
                    <textarea
                      id="template-content" value={editingTemplate.content}
                      onChange={e => handleTemplateEdit('content', e.target.value)}
                      className="w-full h-32 p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 resize-y font-mono text-sm bg-white"
                    />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button 
                        onClick={handleRemoveTemplate}
                        className="flex items-center gap-2 text-red-600 hover:text-red-800 font-bold text-sm transition-transform active:scale-95"
                    >
                        <TrashIcon />
                        Remover Modelo
                    </button>
                    <button 
                        onClick={handleSaveTemplate}
                        className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-200 active:scale-95"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <p className="text-slate-500">Nenhum modelo selecionado. Crie um novo modelo para começar.</p>
          </div>
        )}
      </div>
      
      {/* Action Button */}
      <div className="text-center py-4">
        <button
          onClick={handleExtractAndGenerate}
          disabled={isLoading || (!sourceText && !sourceImage) || templates.length === 0}
          className="w-full max-w-sm flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <WandIcon />
          Extrair e Preencher Todos Modelos
        </button>
      </div>

      {/* Results Section */}
      {(isLoading || error || generatedResults.length > 0) && (
        <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-6 text-slate-900">3. Resultados Gerados</h2>
            {isLoading && <Loader />}
            {error && <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedResults.map((result, index) => (
                    <div key={index} className="flex flex-col h-full bg-slate-100 border border-slate-200 rounded-lg p-4">
                        <h3 className="font-bold text-slate-800 mb-2">{result.templateName}</h3>
                        <div className="flex-grow whitespace-pre-wrap p-3 rounded-md text-sm min-h-[100px]">
                            {result.text}
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                           <button
                              onClick={() => handleSendWhatsApp(result.text)}
                              className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-200 text-sm active:scale-95"
                              aria-label={`Enviar ${result.templateName} via WhatsApp`}
                            >
                              <WhatsAppIcon />
                            </button>
                            <button
                              onClick={() => handleCopy(result.text, result.templateName)}
                              className="flex items-center justify-center gap-2 bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-all duration-200 text-sm w-28 active:scale-95"
                            >
                              {copiedId === result.templateName ? <ClipboardCheckIcon /> : <ClipboardIcon />}
                              {copiedId === result.templateName ? 'Copiado!' : 'Copiar'}
                            </button>
                        </div>
                    </div>
                ))}
              </div>
            )}
        </div>
      )}
      
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-3xl h-auto rounded-lg shadow-2xl"></video>
            <div className="mt-6 flex items-center gap-6">
                <button
                    onClick={closeCamera}
                    className="bg-slate-600 text-white font-bold py-3 px-6 rounded-full hover:bg-slate-700 transition-all"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleCapture}
                    className="bg-indigo-600 text-white font-bold p-5 rounded-full ring-4 ring-white/30 hover:bg-indigo-700 transition-all"
                    aria-label="Capturar Imagem"
                >
                    <CameraIcon className="h-8 w-8" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ExtractorScreen;

