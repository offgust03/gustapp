import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CarePathway, carePathwaysData, FormSection, Question } from './data/carePathways';
import { visitFormData } from './data/visitForm';
import { Patient, PatientDatabase } from './data/patientDatabase';
import FormRenderer from './components/FormRenderer';
import { Screen } from './App';
import { sendToGoogleSheet } from './services/sheetService';
import CarePathwayCard from './components/CarePathwayCard';
import { GeneralVisitIcon } from './components/Icons';

interface CarePathwayScreenProps {
  patientDb: PatientDatabase | null;
  isDbLoaded: boolean;
  setPatientDb: React.Dispatch<React.SetStateAction<PatientDatabase | null>>;
  onNavigate: (screen: Screen, patient?: Patient | null) => void;
}

const CarePathwayScreen: React.FC<CarePathwayScreenProps> = ({ patientDb, isDbLoaded, setPatientDb, onNavigate }) => {
  const [selectedPathway, setSelectedPathway] = useState<CarePathway | { id: 'visit' } | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Patient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeSuggestionBox, setActiveSuggestionBox] = useState<string | null>(null);

  const handleBack = () => {
    setSelectedPathway(null);
    setFormData({});
    setSuggestions([]);
    setActiveSuggestionBox(null);
    setSubmitStatus(null);
  };

  const handleSelectPathway = (pathway: CarePathway | { id: 'visit' }) => {
    setSelectedPathway(pathway);
    setFormData({});
  };

  const getPatientsForPathway = useCallback((): Patient[] => {
    if (!patientDb || !selectedPathway) return [];
    if (selectedPathway.id === 'visit') {
      return [...patientDb.generalPatients, ...patientDb.chronicPatients, ...patientDb.pregnantPatients];
    }
    return patientDb[(selectedPathway as CarePathway).patientDataType] || [];
  }, [patientDb, selectedPathway]);

  const handleInputChange = (id: string, value: any, question?: Question) => {
    setFormData(prev => ({ ...prev, [id]: value }));

    // Aciona o autocomplete apenas para o campo de nome do paciente
    if (id === 'nome' && typeof value === 'string' && value.length > 1) {
      setSearchTerm(value);
      setActiveSuggestionBox(id);
    } else {
      setSuggestions([]);
      setActiveSuggestionBox(null);
    }
  };

  useEffect(() => {
    if (!searchTerm || searchTerm.length <= 1) {
      setSuggestions([]);
      return;
    }

    const patientList = getPatientsForPathway();

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = patientList.filter(p =>
      p.nome.toLowerCase().includes(lowerCaseSearchTerm)
    );
    setSuggestions(filtered);
  }, [searchTerm, getPatientsForPathway]);


  const handleSelectPatient = (patient: Patient) => {
    // Garante que todos os dados do paciente, incluindo os específicos
    // como DUM/DPP para gestantes, sejam preenchidos no formulário.
    const patientData = {
      nome: patient.nome,
      cpf: patient.cpf,
      cns: patient.cns,
      dataNascimento: patient.dataNascimento,
    };
    setFormData(prev => ({ ...prev, ...patient, ...patientData }));
    setSuggestions([]);
    setActiveSuggestionBox(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (Object.keys(formData).length === 0) {
      setSubmitStatus({ type: 'error', message: 'O formulário está vazio.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const dataToSend = {
        ...formData,
        pathwayId: selectedPathway?.id,
        pathwayTitle: pathwayData?.title,
      };
      await sendToGoogleSheet(dataToSend);
      setSubmitStatus({ type: 'success', message: 'Registro salvo com sucesso na planilha!' });
      setTimeout(() => handleBack(), 2000); // Volta para a tela de seleção após sucesso
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
      setSubmitStatus({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pathwayData = useMemo(() => {
    if (!selectedPathway) return null;
    return selectedPathway.id === 'visit' ? visitFormData : carePathwaysData.find(p => p.id === selectedPathway.id);
  }, [selectedPathway]);

  const renderForm = () => {

    if (!pathwayData) return <p>Linha de cuidado não encontrada.</p>;

    return (
      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-6 md:p-8 relative">
        {submitStatus && (
            <div className={`fixed top-5 left-1/2 -translate-x-1/2 py-2 px-5 rounded-full text-white text-sm font-semibold shadow-lg transition-all duration-300 z-50 ${
                submitStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
            role="alert"
            >
            {submitStatus.message}
            </div>
        )}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
          <button onClick={handleBack} aria-label="Voltar" className="text-slate-500 hover:text-indigo-600 transition-colors p-2 -ml-2 rounded-full active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{pathwayData.title}</h2>
            <p className="text-slate-600">{pathwayData.description}</p>
          </div>
        </div>
        <FormRenderer
          title={pathwayData.title}
          description={pathwayData.description}
          formSections={pathwayData.formSections}
          formData={formData}
          handleInputChange={handleInputChange}
          handleInputBlur={() => {}}
          handleSave={handleSubmit}
          handleGoBack={handleBack}
          isSaving={isSubmitting}
          searchResults={suggestions}
          handleSelectPatient={handleSelectPatient}
          patientDb={patientDb}
          toastMessage={submitStatus ? { type: submitStatus.type, text: submitStatus.message } : null}
        />
        <div className="mt-10 pt-6 border-t border-slate-200 text-center">
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full max-w-xs bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-wait flex items-center justify-center gap-2 active:scale-95"
            >
                {isSubmitting ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>Salvando...</span>
                    </>
                ) : "Salvar Registro na Planilha"}
            </button>
        </div>
      </form>
    );
  };

  const renderSelection = () => (
    <div className="bg-white shadow-xl rounded-2xl p-6 md:p-10 space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Visita Domiciliar Geral</h2>
        <p className="text-slate-600 text-center mb-8 max-w-xl mx-auto">
          Para registros de rotina que não se enquadram em uma linha de cuidado específica.
        </p>
        <div className="max-w-md mx-auto">
          <CarePathwayCard
            icon={GeneralVisitIcon}
            title="Registro de Visita Domiciliar"
            description="Preencha o formulário com as informações da visita."
            onClick={() => handleSelectPathway({ id: 'visit' })}
          />
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-base font-semibold text-slate-500">OU</span>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Linhas de Cuidado Específicas</h2>
        <p className="text-slate-600 text-center mb-8 max-w-2xl mx-auto">
          Selecione um formulário estruturado para um acompanhamento direcionado e completo.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {carePathwaysData.map((pathway) => (
            <CarePathwayCard
              key={pathway.id}
              icon={pathway.icon}
              title={pathway.title}
              description={pathway.description}
              onClick={() => handleSelectPathway(pathway)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return selectedPathway ? renderForm() : renderSelection();
};

export default CarePathwayScreen;
