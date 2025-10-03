import { FormSection } from './carePathways';

export const visitFormData: { title: string; description: string; formSections: FormSection[] } = {
  title: "Registro de Visita Domiciliar",
  description: "Formulário para registro de informações gerais da visita.",
  formSections: [
    {
      title: "Identificação",
      questions: [
        { id: 'nome', text: 'Nome do Paciente', type: 'text', span: 'full' },
        { id: 'cns', text: 'Nº do CNS', type: 'text', span: 'half' },
        { id: 'data', text: 'Data da Visita', type: 'date', span: 'half' },
      ],
    },
    {
      title: "Motivo da Visita",
      questions: [
        { id: 'visit_motivo', text: 'Motivo Principal', type: 'multiple-choice', options: [
            { label: 'Busca ativa', value: 'busca_ativa' },
            { label: 'Acompanhamento de rotina', value: 'rotina' },
            { label: 'Queixa específica', value: 'queixa' },
            { label: 'Outro', value: 'outro' },
        ]},
        { id: 'visit_motivo_outro', text: 'Se outro, especifique', type: 'text', span: 'full' },
      ]
    },
    {
        title: "Condições Gerais de Saúde",
        questions: [
            { id: 'health_symptoms', text: 'Sintomas/Queixas Atuais', type: 'text' },
            { id: 'health_medication', text: 'Uso de Medicação', type: 'yes-no' },
            { id: 'health_adherence', text: 'Adesão ao Tratamento', type: 'multiple-choice', options: [{label: 'Boa', value:'boa'}, {label: 'Regular', value:'regular'}, {label: 'Ruim', value:'ruim'}] },
            { id: 'health_appointments', text: 'Consultas/Exames Agendados', type: 'text' },
        ]
    },
    {
        title: "Condições do Ambiente",
        questions: [
            { id: 'env_hygiene', text: 'Condições de Higiene', type: 'multiple-choice', options: [{label: 'Boa', value:'boa'}, {label: 'Regular', value:'regular'}, {label: 'Ruim', value:'ruim'}] },
            { id: 'env_safety', text: 'Ambiente seguro (sem risco de quedas, etc.)?', type: 'yes-no' },
            { id: 'env_social', text: 'Apoio familiar/social presente?', type: 'yes-no' },
        ]
    },
    {
      title: "Observações Gerais",
      questions: [
        { id: 'visit_observacoes', text: 'Observações, orientações e encaminhamentos', type: 'textarea' },
      ],
    },
  ]
};