// Trigger recompilation
import React, { useState, useEffect } from 'react';
import { carePathwaysData, Question, FormSection } from '../data/carePathways';
import { visitFormData } from '../data/visitForm';
import { Patient, PatientDatabase, GeneralPatient, Visit } from '../data/patientDatabase';
import { findPatientsByName, findPatientByDocument } from '../services/patientService';
import { saveVisitData } from '../services/dbService';
import Card from '../components/Card';
import FormRenderer from '../components/FormRenderer';
import { ArrowLeftIcon, ClipboardListIcon } from '../components/Icons';
import Loader from '../components/Loader';
import { Screen } from '../App';

interface CarePathwayScreenProps {
  patientDb: PatientDatabase | null;
  isDbLoaded: boolean;
  setPatientDb: (db: PatientDatabase) => void;
  onNavigate: (screen: Screen, patient: Patient | null) => void;
}

const CarePathwayScreen: React.FC<CarePathwayScreenProps> = ({ patientDb, isDbLoaded, setPatientDb, onNavigate }) => {
  const [currentView, setCurrentView] = useState<'selection' | string>('selection');
  const [formData, setFormData] = useState<Record<string, string | number | readonly string[] | undefined>>({});
  const [searchResults, setSearchResults] = useState<GeneralPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedPathway = carePathwaysData.find(p => p.id === currentView);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const resetFormState = (keepPatient = false) => {
    setFormData({});
    setSearchResults([]);
    if (!keepPatient) {
        setSelectedPatient(null);
    }
  };

  const handleGoBack = () => {
    if (selectedPathway || currentView === 'visit') {
        setCurrentView('selection');
        resetFormState(true);
    } else {
        onNavigate('home', null);
    }
    window.scrollTo(0, 0);
  };

  const handleInputChange = (id: string, value: string | number | readonly string[] | undefined) => {
    setFormData(prev => ({ ...prev, [id]: value }));

    if (id === 'nome' && typeof value === 'string' && value.length > 0 && patientDb) {
      const results = findPatientsByName(value, patientDb);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleInputBlur = async (id: string) => {
    if ((id === 'cpf' || id === 'cns') && formData[id] && patientDb && selectedPathway) {
      const patient = findPatientByDocument(
        id as 'cpf' | 'cns',
        formData[id],
        patientDb,
        selectedPathway.patientDataType
      );
      if (patient) {
        handleSelectPatient(patient);
      }
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, ...patient }));
    setSearchResults([]);
    setToastMessage({ type: 'success', text: "Paciente encontrado e dados preenchidos." });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cpf) {
        setToastMessage({ type: 'error', text: "CPF do paciente é obrigatório." });
        return;
    }
    setIsSaving(true);

    try {
        const updatedDb = await saveVisitData(formData);
        setPatientDb(updatedDb);
        setIsSaving(false);
        setToastMessage({ type: 'success', text: "Registro salvo com sucesso!" });

        setTimeout(() => {
            const updatedPatient = findPatientByDocument('cpf', formData.cpf, updatedDb, 'generalPatients');
            if(updatedPatient) {
                onNavigate('visitHistory', updatedPatient);
            }
        }, 1500);

    } catch(error: unknown) {
        console.error("Erro ao salvar o registro:", error);
        setIsSaving(false);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
        setToastMessage({ type: 'error', text: `Falha ao salvar: ${errorMessage}` });
    }
  };





  if (currentView === 'visit') return <FormRenderer title={visitFormData.title} description={visitFormData.description} formSections={visitFormData.formSections} formData={formData} handleInputChange={handleInputChange} handleInputBlur={handleInputBlur} handleSave={handleSave} handleGoBack={handleGoBack} isSaving={isSaving} searchResults={searchResults} handleSelectPatient={handleSelectPatient} patientDb={patientDb} toastMessage={toastMessage} />;
  if (selectedPathway) return <FormRenderer title={selectedPathway.title} description={selectedPathway.description} formSections={selectedPathway.formSections} formData={formData} handleInputChange={handleInputChange} handleInputBlur={handleInputBlur} handleSave={handleSave} handleGoBack={handleGoBack} isSaving={isSaving} searchResults={searchResults} handleSelectPatient={handleSelectPatient} patientDb={patientDb} toastMessage={toastMessage} />;

  // Selection View for new record
  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 md:p-10 space-y-12">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
            <button onClick={() => onNavigate('home', null)} aria-label="Voltar" className="text-slate-500 hover:text-indigo-600 transition-colors p-2 -ml-2 rounded-full active:scale-95">
                <ArrowLeftIcon />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Criar Novo Registro</h2>
                <p className="text-slate-600">Selecione o tipo de formulário para iniciar um novo registro de visita.</p>
            </div>
        </div>
        
        <div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Visita Domiciliar Geral</h3>
            <p className="text-slate-600 text-center mb-8 max-w-xl mx-auto">Para registros de rotina que não se enquadram em uma linha de cuidado específica.</p>
            <div className="max-w-md mx-auto">
                <Card
                    icon={ClipboardListIcon}
                    title="Registro de Visita Domiciliar"
                    description="Preencha o formulário com as informações da visita."
                    onClick={() => { setCurrentView('visit'); resetFormState(true); }}
                />
            </div>
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-300" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-base font-semibold text-slate-500">OU</span></div>
        </div>

        <div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Linhas de Cuidado Específicas</h3>
            <p className="text-slate-600 text-center mb-8 max-w-2xl mx-auto">Selecione um formulário estruturado para um acompanhamento direcionado.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {carePathwaysData.map(pathway => (
                <Card
                    key={pathway.id}
                    icon={pathway.icon}
                    title={pathway.title}
                    description={pathway.description}
                    onClick={() => { setCurrentView(pathway.id); resetFormState(true); }}
                />
                ))}
            </div>
        </div>
    </div>
  );
};

export default CarePathwayScreen;