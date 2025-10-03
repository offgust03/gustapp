
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import RewriteScreen from './screens/RewriteScreen';
import ExtractorScreen from './screens/ExtractorScreen';
import CarePathwayScreen from './screens/CarePathwayScreen';
import VisitHistoryScreen from './screens/VisitHistoryScreen';
import { loadPatients } from './services/dbService';
import { Patient, PatientDatabase, patientDatabase as mockPatientDatabase } from './data/patientDatabase';


export type Screen = 'home' | 'rewrite' | 'extractor' | 'care' | 'dbManagement' | 'visitHistory';
export type RewriteTarget = 'record' | 'patient';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [patientDb, setPatientDb] = useState<PatientDatabase | null>(null);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    // Tenta carregar o banco de dados do IndexedDB ao iniciar o app
    const initDb = async () => {
      try {
        const db = await loadPatients();
        if (db) {
          setPatientDb(db);
        } else {
          setPatientDb(mockPatientDatabase);
        }
      } catch (error) {
        console.error("Falha ao carregar a base de dados local:", error);
      } finally {
        setIsDbLoaded(true); // Marca que a tentativa de carregamento terminou
      }
    };
    initDb();
  }, []);


  const navigateTo = (screen: Screen, patient: Patient | null = null) => {
    setSelectedPatient(patient);
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'rewrite':
        return <RewriteScreen />;
      case 'extractor':
        return <ExtractorScreen />;
      case 'care':
        return <CarePathwayScreen patientDb={patientDb} isDbLoaded={isDbLoaded} setPatientDb={setPatientDb} onNavigate={navigateTo} />;
      case 'dbManagement':
        // Passa os setters para a tela de gerenciamento
        return <DbManagementScreen setPatientDb={setPatientDb} />;
      case 'visitHistory':
        return <VisitHistoryScreen patient={selectedPatient} onBack={() => navigateTo('care')} onEditVisit={() => {}} />;
      case 'home':
      default:
        return <HomeScreen onNavigate={navigateTo} />;
    }
  };

  const getHeaderDetails = () => {
    switch (currentScreen) {
      case 'rewrite':
        return {
          title: 'Revisor de Textos para Saúde',
          description: 'Transforme suas anotações em registros profissionais',
        };
      case 'extractor':
        return {
          title: 'Extrair e Preencher',
          description: 'Extraia dados de textos e preencha modelos automaticamente',
        };
      case 'care':
        return {
          title: 'Linhas de Cuidado & Visita Domiciliar',
          description: 'Selecione uma linha de cuidado para iniciar o acompanhamento',
        };
      case 'dbManagement':
        return {
            title: 'Gerenciar Base de Dados',
            description: 'Carregue e gerencie sua base de pacientes local',
        };
      case 'visitHistory':
        return {
            title: 'Histórico de Visitas',
            description: 'Visualize todas as visitas domiciliares registradas',
        };
      case 'home':
      default:
        return {
          title: 'Assistente de Saúde IA',
          description: 'Suas ferramentas de IA para otimizar o dia a dia',
        };
    }
  };

  const { title, description } = getHeaderDetails();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      <Header
        title={title}
        description={description}
        showBackButton={currentScreen !== 'home'}
        onBack={() => navigateTo('home')}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderScreen()}
      </main>
      <footer className="text-center py-8 text-slate-500 text-sm">
        <p>Desenvolvido com a API do Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
