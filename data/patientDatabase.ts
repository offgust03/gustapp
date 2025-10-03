// Interfaces para os diferentes tipos de pacientes

export interface Visit {
  id: string;
  registeredAt: string;
  formData: Record<string, any>;
}

export interface GeneralPatient {
  id?: string; // ID pode ser opcional para novos pacientes
  nome: string;
  nomeSocial?: string;
  dataNascimento: string;
  cpf: string;
  cns: string;
  telefone: string;
  visits?: Visit[];
  [key: string]: any; // Permite outras propriedades
}

export interface PregnantPatient extends GeneralPatient {
  dum: string; // Data da Última Menstruação
  dpp: string; // Data Provável do Parto
  semanasGestacao: string;
  vacinacao: 'Em dia' | 'Atrasada' | 'Não iniciada';
  ultimaConsulta: string;
  proximaConsulta: string;
}

export interface ChronicPatient extends GeneralPatient {
  condicao: 'Diabetes' | 'Hipertensão' | 'Ambos';
  ultimoResultadoGlicemia?: string;
  ultimaAfericaoPA?: string;
}

// Union type para qualquer tipo de paciente
export type Patient = GeneralPatient | PregnantPatient | ChronicPatient;

// Estrutura do banco de dados completo
export interface PatientDatabase {
    generalPatients: GeneralPatient[];
    pregnantPatients: PregnantPatient[];
    chronicPatients: ChronicPatient[];
}

// Mock de dados para o banco de dados
export const patientDatabase: PatientDatabase = {
    generalPatients: [
        { id: '1', nome: 'Carlos Andrade', dataNascimento: '1980-05-15', cpf: '111.222.333-44', cns: '123456789012345', telefone: '(11) 91111-1111', visits: [] },
        { id: '2', nome: 'Fernanda Lima', dataNascimento: '1992-11-20', cpf: '222.333.444-55', cns: '234567890123456', telefone: '(21) 92222-2222', visits: [] },
    ],
    pregnantPatients: [
        { 
            id: '101', 
            nome: 'Juliana Paes', 
            dataNascimento: '1995-02-10', 
            cpf: '333.444.555-66', 
            cns: '345678901234567', 
            telefone: '(31) 93333-3333',
            dum: '2024-05-01',
            dpp: '2025-02-05',
            semanasGestacao: '12 semanas',
            vacinacao: 'Em dia',
            ultimaConsulta: '2024-07-10',
            proximaConsulta: '2024-08-10',
            visits: []
        },
    ],
    chronicPatients: [
        { 
            id: '201', 
            nome: 'Roberto Carlos da Silva', 
            dataNascimento: '1960-03-25', 
            cpf: '444.555.666-77', 
            cns: '456789012345678', 
            telefone: '(41) 94444-4444',
            condicao: 'Hipertensão',
            ultimaAfericaoPA: '140/90 mmHg',
            visits: []
        },
        { 
            id: '202', 
            nome: 'Maria da Graça Souza', 
            dataNascimento: '1955-09-01', 
            cpf: '555.666.777-88', 
            cns: '567890123456789', 
            telefone: '(51) 95555-5555',
            condicao: 'Diabetes',
            ultimoResultadoGlicemia: '150 mg/dL',
            visits: []
        },
    ],
};