
import React from 'react';
import Card from '../components/Card';
import { AnalyticsIcon, WebIcon, StethoscopeIcon, DatabaseIcon, ClockIcon } from '../components/Icons';
import { Screen } from '../App';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 md:p-10">
      <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">Bem-vindo!</h2>
      <p className="text-slate-600 text-center mb-10 max-w-2xl mx-auto">Selecione uma das ferramentas abaixo para otimizar suas tarefas diárias e focar no que mais importa: o cuidado com o paciente.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card
          icon={AnalyticsIcon}
          title="Revisor de Textos com IA"
          description="Transforme anotações de visitas em registros profissionais para prontuários ou em mensagens claras para pacientes."
          onClick={() => onNavigate('rewrite')}
        />
        <Card
          icon={WebIcon}
          title="Extrator Inteligente de Dados"
          description="Extraia informações de textos e preencha formulários e modelos automaticamente, economizando tempo."
          onClick={() => onNavigate('extractor')}
        />
        <Card
            icon={StethoscopeIcon}
            title="Acompanhamento e Linhas de Cuidado"
            description="Acesse formulários de visita domiciliar estruturados para um acompanhamento eficiente de pacientes."
            onClick={() => onNavigate('care')}
        />
        <Card
          icon={DatabaseIcon}
          title="Gerenciar Base de Pacientes"
          description="Carregue e gerencie sua base de dados local de pacientes de forma segura a partir de um arquivo .xlsx."
          onClick={() => onNavigate('dbManagement')}
        />
        <Card
          icon={ClockIcon}
          title="Histórico de Visitas"
          description="Visualize todas as visitas domiciliares que já foram registradas no sistema."
          onClick={() => onNavigate('visitHistory')}
        />
      </div>
    </div>
  );
};

export default HomeScreen;
