import React from 'react';
import { HeartPulseIcon, BabyIcon, LungsIcon } from '../components/Icons';
import { PatientDatabase } from './patientDatabase';

export type QuestionType = 'yes-no' | 'multiple-choice' | 'text' | 'textarea' | 'number' | 'date' | 'info-header';

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  condition?: string;
  placeholder?: string;
  span?: 'full' | 'half';
}

export interface FormSection {
  title: string;
  questions: Question[];
}

export interface CarePathway {
  id: string;
  title: string;
  description: string;
  icon: React.FC;
  formSections: FormSection[];
  patientDataType: keyof PatientDatabase;
}

const patientIdSection: FormSection = {
  title: "Identificação do Paciente",
  questions: [
    { id: 'nome', text: 'Nome', type: 'text', span: 'full' },
    { id: 'nomeSocial', text: 'Nome Social', type: 'text', span: 'full' },
    { id: 'dataNascimento', text: 'Data de Nascimento', type: 'date', span: 'half' },
    { id: 'cpf', text: 'CPF', type: 'text', span: 'half' },
    { id: 'cns', text: 'Nº do CNS (Cartão Nacional de Saúde)', type: 'text', span: 'half' },
    { id: 'telefone', text: 'Telefone(s)', type: 'text', span: 'half' },
  ],
};

const commonQuestions: Question[] = [
    { id: 'esqueceuMedicacao', text: 'Nas duas últimas semanas você esqueceu alguma de tomar alguma dose da medicação?', type: 'yes-no' },
    { id: 'dificuldadeLembrarRemedio', text: 'Com que frequência você sente que é difícil de se lembrar de tomar o remédio?', type: 'multiple-choice', options: [{label: 'Sempre', value: 'sempre'}, {label: 'Quase sempre', value: 'quase_sempre'}, {label: 'Às vezes', value: 'as_vezes'}, {label: 'Quase nunca', value: 'quase_nunca'}, {label: 'Nunca', value: 'nunca'}] },
    { id: 'desconfortoMedicacao', text: 'Você sente algum desconforto causado pela medicação?', type: 'yes-no' },
    { id: 'dificuldadeTratamento', text: 'Você tem alguma dificuldade ou dúvida em relação ao tratamento?', type: 'yes-no' },
    { id: 'mudancaEstiloVida', text: 'Você está passando por alguma mudança de estilo de vida? (Se precisar de ajuda, informe à equipe)', type: 'multiple-choice', options: [{label: 'Não', value: 'nao'}, {label: 'Cessando tabagismo', value: 'cessando_tabagismo'}, {label: 'Iniciando atividade física', value: 'iniciando_atividade_fisica'}, {label: 'Mudando a alimentação', value: 'mudando_alimentacao'}] },
    { id: 'atendidoUpaEmergencia', text: 'Você precisou ser atendido em UPA ou Emergência?', type: 'yes-no' },
];

const idosoVulneravelSection: FormSection = {
  title: 'Exclusivo para idoso vulnerável',
  questions: [
    { id: 'necessitaCuidador', text: 'Necessita de cuidador?', type: 'yes-no' },
    { id: 'cuidadorPresente', text: 'O cuidador estava na residência?', type: 'yes-no' },
    { id: 'pacienteResponde', text: 'O paciente consegue responder às perguntas?', type: 'yes-no' },
    { id: 'deixouTomarMedicacao', text: 'Nas duas últimas semanas você deixou de tomar alguma dose da medicação?', type: 'yes-no' },
    { id: 'quantasRefeicoes', text: 'Quantas refeições você tem feito por dia?', type: 'text', placeholder: 'Ex: 1, 2, 3 ou 4+' },
    { id: 'temFerida', text: 'Você está com alguma ferida?', type: 'yes-no' },
  ]
};

export const carePathwaysData: CarePathway[] = [
  {
    id: 'diabetes',
    title: 'Acompanhamento de Doença Crônica - Diabetes',
    description: 'Formulário para visita domiciliar de pacientes com Diabetes.',
    icon: HeartPulseIcon,
    patientDataType: 'chronicPatients',
    formSections: [
      patientIdSection,
      {
        title: 'Perguntas Gerais',
        questions: commonQuestions,
      },
      {
        title: 'Exclusivo para quem tem Diabetes',
        questions: [
            { id: 'machucadoPe', text: 'Você está com algum machucado no pé?', type: 'yes-no' },
        ]
      },
      idosoVulneravelSection,
      { title: "Informações Adicionais", questions: [{ id: 'infoAdicionais', text: 'Registre aqui outras informações relevantes da visita.', type: 'textarea'}] }
    ],
  },
  {
    id: 'hipertensao',
    title: 'Acompanhamento de Doença Crônica - Hipertensão',
    description: 'Formulário para visita domiciliar de pacientes com Hipertensão.',
    icon: HeartPulseIcon,
    patientDataType: 'chronicPatients',
    formSections: [
      patientIdSection,
      {
        title: 'Perguntas Gerais',
        questions: commonQuestions,
      },
      idosoVulneravelSection,
      { title: "Informações Adicionais", questions: [{ id: 'infoAdicionais', text: 'Registre aqui outras informações relevantes da visita.', type: 'textarea'}] }
    ],
  },
  {
    id: 'gestantes',
    title: 'Acompanhamento de Gestantes',
    description: 'Formulário para visita domiciliar de gestantes.',
    icon: BabyIcon,
    patientDataType: 'pregnantPatients',
    formSections: [
        { ...patientIdSection, title: 'Identificação da Gestante' },
        { title: 'Dados da Gestação (Preenchido Automaticamente)', questions: [
            {id: 'dum', text: 'DUM (Data da Última Menstruação)', type: 'date'}, 
            {id: 'dpp', text: 'DPP (Data Provável do Parto)', type: 'date'},
            {id: 'semanasGestacao', text: 'Semanas de Gestação', type: 'text'},
            {id: 'vacinacao', text: 'Vacinação em Dia', type: 'text'},
            {id: 'ultimaConsulta', text: 'Última Consulta', type: 'date'},
            {id: 'proximaConsulta', text: 'Próxima Consulta', type: 'date'},
        ]},
        { title: 'Perguntas da Visita', questions: [
            { id: 'mediuPressao', text: 'Você mediu a pressão? (Se sim, registrar nas observações)', type: 'yes-no', condition: '0 a 41 semanas'},
            { id: 'atendidaUpa', text: 'Você precisou ser atendida em UPA ou maternidade neste mês?', type: 'yes-no', condition: '0 a 41 semanas'},
            { id: 'realizouExames', text: 'Você realizou os exames solicitados pela equipe?', type: 'yes-no', condition: '0 a 41 semanas'},
            { id: 'enjoando', text: 'Você está enjoando?', type: 'yes-no', condition: '0 a 12 semanas'},
            { id: 'sangramento', text: 'Você teve algum sangramento?', type: 'yes-no', condition: '0 a 12 semanas'},
            { id: 'ardenciaUrinar', text: 'Você teve alguma ardência ao urinar desde a minha última visita?', type: 'yes-no', condition: '0 a 24 semanas'},
            { id: 'ganhoPeso', text: 'Como você avalia seu ganho de peso?', type: 'multiple-choice', options: [{label: 'Adequado', value: 'adequado'}, {label: 'Muito peso', value: 'muito'}, {label: 'Pouco peso', value: 'pouco'}], condition: '13 a 41 semanas'},
            { id: 'inchacoPernas', text: 'Você tem inchaço nas pernas?', type: 'yes-no', condition: '13 a 41 semanas'},
            { id: 'bebeMexeu', text: 'Você sentiu o bebê mexer nas últimas 24 horas?', type: 'yes-no', condition: '25 a 41 semanas'},
            { id: 'visitouMaternidade', text: 'Você visitou a maternidade de referência?', type: 'yes-no', condition: '25 a 41 semanas'},
        ]},
        { title: "Observações da Visita", questions: [{ id: 'infoAdicionaisGestante', text: 'Registre aqui a Pressão Arterial e outras informações.', type: 'textarea'}] }
    ],
  },
  {
    id: 'crianca',
    title: 'Acompanhamento da Criança na Primeira Infância',
    description: 'Formulário para visita domiciliar de crianças de 0 a 6 anos.',
    icon: BabyIcon,
    patientDataType: 'generalPatients',
    formSections: [
        { ...patientIdSection, title: 'Identificação da Criança' },
        { title: 'Perguntas', questions: [
            { id: 'primeiraConsulta', text: 'Realizou a primeira consulta em até 7 dias?', type: 'yes-no', condition: '0 a 28 dias' },
            { id: 'ondeDorme', text: 'Onde dorme a criança?', type: 'multiple-choice', options: [{label: 'Berço', value: 'berco'}, {label: 'Chão', value: 'chao'}, {label: 'Cama com outras pessoas', value: 'cama_outros'}, {label: 'Sofá/Cama/Rede', value: 'sofa_cama_rede'}], condition: '0 a 5 meses' },
            { id: 'compareceConsultas', text: 'A criança está comparecendo às consultas? Se NÃO, por que?', type: 'text', condition: '0 a 6 anos' },
            { id: 'vacinacao', text: 'Vacinação em dia?', type: 'yes-no', condition: '0 a 6 anos' },
            { id: 'alimentacao', text: 'Como está a alimentação da criança?', type: 'text', condition: '0 a 6 anos' },
            { id: 'sinaisRisco', text: 'Sinais de risco?', type: 'text', condition: '0 a 6 anos' },
            { id: 'desenvolvimento', text: 'A mãe percebeu algum problema ou alteração no desenvolvimento da criança?', type: 'yes-no', condition: '0 a 6 anos' },
            { id: 'matriculadaCreche', text: 'A criança está matriculada na creche ou pré-escola? Qual?', type: 'text', condition: '6 meses a 6 anos' },
        ]},
        { title: "Informações Adicionais", questions: [{ id: 'infoAdicionaisCrianca', text: 'Registre aqui outras informações relevantes.', type: 'textarea'}] }
    ],
  },
  {
    id: 'tuberculose',
    title: 'Acompanhamento de Tuberculose',
    description: 'Formulário para visita domiciliar de pacientes com Tuberculose.',
    icon: LungsIcon,
    patientDataType: 'generalPatients',
    formSections: [
      patientIdSection,
      {
        title: 'Perguntas',
        questions: [
          { id: 'tossindo', text: 'Você está tossindo?', type: 'yes-no' },
          { id: 'desconfortoMedicacaoTB', text: 'A medicação tem causado algum desconforto? Especifique.', type: 'text' },
          { id: 'resistenciaRemedio', text: 'Apresenta alguma resistência para tomar remédio?', type: 'yes-no' },
          { id: 'contatosExaminados', text: 'Das pessoas de contato, quantas não foram examinadas após o diagnóstico?', type: 'number' },
        ]
      },
      { title: "Informações Adicionais", questions: [{ id: 'infoAdicionaisTB', text: 'Registre aqui outras informações, como controle de escarro.', type: 'textarea'}] }
    ],
  },
];