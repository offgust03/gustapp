import { patientDatabase, Patient, GeneralPatient, PatientDatabase } from '../data/patientDatabase';

/**
 * Normaliza uma string removendo acentos e convertendo para minúsculas.
 */
const normalizeString = (str: string): string => {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
};

/**
 * Procura pacientes pelo nome em todas as bases de dados.
 * @param name O nome ou parte do nome a ser pesquisado.
 * @param db A base de dados carregada para pesquisar.
 * @returns Um array de pacientes que correspondem à pesquisa.
 */
export const findPatientsByName = (name: string, db: PatientDatabase): GeneralPatient[] => {
    if (!name) return [];
    const normalizedName = normalizeString(name);
    
    const allPatients = [
        ...db.generalPatients,
        ...db.pregnantPatients,
        ...db.chronicPatients,
    ];

    const uniquePatients = Array.from(new Map(allPatients.map(p => [p.cpf, p])).values());

    return uniquePatients.filter(p => normalizeString(p.nome).includes(normalizedName));
};


/**
 * Procura um paciente por CPF ou CNS, com prioridade para a base de dados específica da linha de cuidado.
 * @param field O campo a ser pesquisado ('cpf' or 'cns').
 * @param value O valor do CPF ou CNS a ser encontrado.
 * @param db A base de dados carregada para pesquisar.
 * @param primaryType O tipo de base de dados a ser pesquisado primeiro.
 * @returns O paciente encontrado ou null.
 */
export const findPatientByDocument = (
    field: 'cpf' | 'cns', 
    value: string, 
    db: PatientDatabase,
    primaryType: keyof PatientDatabase
): Patient | null => {
    if (!value) return null;

    const searchValue = value.replace(/[^\d]/g, '');

    // 1. Procura na base de dados primária/específica primeiro
    const primaryDb = db[primaryType];
    if (Array.isArray(primaryDb)) {
        const patientInPrimary = primaryDb.find(p => p[field]?.replace(/[^\d]/g, '') === searchValue);
        if (patientInPrimary) {
            return patientInPrimary;
        }
    }

    // 2. Se não encontrou, procura na base de dados geral
    const patientInGeneral = db.generalPatients.find(p => p[field]?.replace(/[^\d]/g, '') === searchValue);
    if (patientInGeneral) {
        return patientInGeneral;
    }

    return null;
};