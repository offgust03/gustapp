import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { UploadIcon, TrashIcon } from '../components/Icons';
import { PatientDatabase } from '../data/patientDatabase';
import { savePatients, clearPatients, getDbStatus } from '../services/dbService';

interface DbManagementScreenProps {
  setPatientDb: (db: PatientDatabase | null) => void;
}

type DbStatus = {
    patientCount: number;
    loadedAt: string;
} | null;


const DbManagementScreen: React.FC<DbManagementScreenProps> = ({ setPatientDb }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<DbStatus>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkStatus = async () => {
        const currentStatus = await getDbStatus();
        setStatus(currentStatus);
    };
    checkStatus();
  }, []);

  const processAndSaveFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      const db: PatientDatabase = {
        generalPatients: [],
        pregnantPatients: [],
        chronicPatients: [],
      };

      // Helper para converter datas do Excel (número de dias desde 1900) para AAAA-MM-DD
      const excelDateToJSDate = (serial: number | string): string => {
        if(typeof serial !== 'number') return serial;
        const utc_days  = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;                                        
        const date_info = new Date(utc_value * 1000);
        const fractional_day = serial - Math.floor(serial) + 0.0000001;
        let total_seconds = Math.floor(86400 * fractional_day);
        const seconds = total_seconds % 60;
        total_seconds -= seconds;
        const hours = Math.floor(total_seconds / (60 * 60));
        const minutes = Math.floor(total_seconds / 60) % 60;
        const d = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
        return d.toISOString().split('T')[0]; // Formata para AAAA-MM-DD
      };
      
      const sheetExists = (name: string) => workbook.SheetNames.includes(name);

      const processSheet = (sheetName: string): any[] => {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) return [];
        
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
        
        // Converte as datas de todos os registros
        jsonData.forEach(record => {
            if (record.dataNascimento) record.dataNascimento = excelDateToJSDate(record.dataNascimento);
            if (record.dum) record.dum = excelDateToJSDate(record.dum);
            if (record.dpp) record.dpp = excelDateToJSDate(record.dpp);
            if (record.ultimaConsulta) record.ultimaConsulta = excelDateToJSDate(record.ultimaConsulta);
            if (record.proximaConsulta) record.proximaConsulta = excelDateToJSDate(record.proximaConsulta);
        });

        return jsonData;
      };

      // Mapeamento das abas para os tipos de pacientes
      if (sheetExists('TPC')) { db.generalPatients.push(...processSheet('TPC')); }
      if (sheetExists('PBK')) { db.generalPatients.push(...processSheet('PBK')); }
      if (sheetExists('PBG')) { db.pregnantPatients = processSheet('PBG'); }
      if (sheetExists('PBD')) {
        const diabetesPatients = processSheet('PBD').map(p => ({ ...p, condicao: 'Diabetes' }));
        db.chronicPatients.push(...diabetesPatients);
      }
      if (sheetExists('PBH')) {
        const hypertensionPatients = processSheet('PBH').map(p => ({ ...p, condicao: 'Hipertensão' }));
        db.chronicPatients.push(...hypertensionPatients);
      }
      
      const totalPatients = db.generalPatients.length + db.pregnantPatients.length + db.chronicPatients.length;
      if (totalPatients === 0) {
        throw new Error("Nenhuma das abas esperadas (TPC, PBK, PBG, PBD, PBH) foi encontrada no arquivo ou elas estão vazias.");
      }
      
      await savePatients(db);
      setPatientDb(db);
      setStatus(await getDbStatus());

    } catch (err: any) {
      console.error("Erro ao processar o arquivo:", err);
      setError(`Falha ao ler o arquivo. ${err.message || 'Verifique o formato do arquivo e os nomes das abas.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndSaveFile(file);
    }
    e.target.value = ''; // Reseta o input para permitir o upload do mesmo arquivo novamente
  };
  
  const handleClearDb = async () => {
    if(window.confirm("Tem certeza que deseja apagar a base de dados local? Os dados dos pacientes serão removidos do navegador.")){
        await clearPatients();
        setPatientDb(null);
        setStatus(null);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      processAndSaveFile(file);
    } else {
      setError("Por favor, solte um arquivo .xlsx válido.");
    }
  };


  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 space-y-8 max-w-3xl mx-auto">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Base de Dados de Pacientes</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
                Carregue um arquivo .xlsx para criar sua base de dados local. Os dados ficarão salvos de forma segura apenas no seu navegador.
            </p>
        </div>
        
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
            <h3 className="font-bold text-lg text-slate-700">Status Atual</h3>
            {status ? (
                <div className="mt-2 text-green-800 bg-green-100/70 p-4 rounded-lg">
                    <p className="font-semibold">Base de dados carregada com sucesso!</p>
                    <p>Total de pacientes: <span className="font-bold">{status.patientCount}</span></p>
                    <p className="text-sm mt-1">Carregada em: {status.loadedAt}</p>
                </div>
            ) : (
                <div className="mt-2 text-slate-700 bg-slate-100 p-4 rounded-lg">
                    <p>Nenhuma base de dados carregada.</p>
                </div>
            )}
            {status && (
                 <button 
                    onClick={handleClearDb}
                    className="mt-4 inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-semibold transition-transform active:scale-95"
                >
                    <TrashIcon />
                    Limpar Base de Dados
                </button>
            )}
        </div>

        <div>
            <div 
                onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
                onDragOver={handleDragOver} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative group flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300
                    ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'} active:scale-[0.98]`}
            >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx" className="hidden" />
                {isProcessing ? (
                    <>
                         <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         <p className="font-semibold text-indigo-700">Processando arquivo...</p>
                    </>
                ) : (
                    <>
                        <UploadIcon className="h-10 w-10 mb-2 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                        <p className="font-semibold text-slate-700">Arraste e solte o arquivo .xlsx aqui</p>
                        <p className="text-slate-500 text-sm">ou clique para selecionar</p>
                    </>
                )}
            </div>
            {error && <p className="text-red-600 text-center mt-4 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
        </div>
        
        <div className="text-sm text-slate-600 bg-slate-100 p-5 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-700 mb-2">Instruções para o arquivo .xlsx:</h4>
            <ul className="list-disc list-inside space-y-2">
                <li>O arquivo <strong>deve</strong> conter abas (planilhas) com os seguintes nomes exatos. Você pode incluir uma ou mais delas:</li>
                <ul className="list-['-_'] list-inside pl-5 mt-2 space-y-1">
                    <li><code className="bg-slate-200 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">TPC</code>: Para a base de pacientes geral.</li>
                    <li><code className="bg-slate-200 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">PBK</code>: Para a base de crianças.</li>
                    <li><code className="bg-slate-200 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">PBG</code>: Para a base de gestantes.</li>
                    <li><code className="bg-slate-200 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">PBD</code>: Para a base de pacientes com Diabetes.</li>
                    <li><code className="bg-slate-200 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">PBH</code>: Para a base de pacientes com Hipertensão.</li>
                </ul>
                <li>A primeira linha de cada aba deve conter os títulos das colunas (ex: nome, cpf, cns, dataNascimento).</li>
                <li>As colunas de data (como `dataNascimento`, `dpp`, etc.) devem estar em um formato de data padrão do Excel.</li>
            </ul>
        </div>
    </div>
  );
};

export default DbManagementScreen;