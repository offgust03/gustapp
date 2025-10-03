import { PatientDatabase, GeneralPatient, Patient, Visit } from '../data/patientDatabase';

const DB_NAME = 'PatientDB';
const DB_VERSION = 1;
const STORE_NAME = 'patients';

interface DbData {
  id: 'patientData';
  database: PatientDatabase;
  loadedAt: string;
}

const openDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject("Erro ao abrir o IndexedDB.");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const savePatients = async (dbData: PatientDatabase): Promise<void> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const dataToStore: DbData = {
            id: 'patientData',
            database: dbData,
            loadedAt: new Date().toISOString(),
        };
        const request = store.put(dataToStore);
        request.onerror = () => reject('Erro ao salvar os dados.');
        request.onsuccess = () => resolve();
    });
};

export const loadPatients = async (): Promise<PatientDatabase | null> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('patientData');
        request.onerror = () => reject('Erro ao carregar os dados.');
        request.onsuccess = () => {
            const result: DbData | undefined = request.result;
            resolve(result ? result.database : null);
        };
    });
};

export const getAllVisits = async (): Promise<Visit[]> => {
    const patientDb = await loadPatients();
    if (!patientDb) {
        return [];
    }

    const allVisits: Visit[] = [];

    const extractVisits = (patients: Patient[]) => {
        for (const patient of patients) {
            if (patient.visits) {
                for (const visit of patient.visits) {
                    allVisits.push({ ...visit, patientName: patient.nome });
                }
            }
        }
    };

    extractVisits(patientDb.generalPatients);
    extractVisits(patientDb.pregnantPatients);
    extractVisits(patientDb.chronicPatients);

    // Sort visits by date in descending order
    allVisits.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());

    return allVisits;
};


export const clearPatients = async (): Promise<void> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onerror = () => reject('Erro ao limpar a base de dados.');
        request.onsuccess = () => resolve();
    });
};

export const getDbStatus = async (): Promise<{ patientCount: number; loadedAt: string; } | null> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('patientData');
        request.onerror = () => reject('Erro ao verificar status.');
        request.onsuccess = () => {
            const result: DbData | undefined = request.result;
            if (result) {
                const count = 
                    (result.database.generalPatients?.length || 0) +
                    (result.database.pregnantPatients?.length || 0) +
                    (result.database.chronicPatients?.length || 0);

                resolve({
                    patientCount: count,
                    loadedAt: new Date(result.loadedAt).toLocaleString('pt-BR'),
                });
            } else {
                resolve(null);
            }
        };
    });
};

export const saveVisitData = async (formData: Record<string, any>): Promise<PatientDatabase> => {
    const db = await openDb();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const getRequest = store.get('patientData');

        getRequest.onerror = () => reject('Erro ao carregar dados para atualização.');

        getRequest.onsuccess = () => {
            const result: DbData | undefined = getRequest.result;
            const currentDb = result?.database ?? { generalPatients: [], pregnantPatients: [], chronicPatients: [] };

            const { visitId, ...visitFormData } = formData;
            const cpfToFind = visitFormData.cpf?.replace(/[^\d]/g, '');
            let patientFound = false;

            if (!cpfToFind) {
                return reject("CPF é obrigatório para salvar um registro.");
            }

            const allPatientArrays: Patient[][] = [
                currentDb.chronicPatients,
                currentDb.pregnantPatients,
                currentDb.generalPatients,
            ];

            let targetPatient: Patient | null = null;
            let patientIndex: number = -1;
            let patientArray: Patient[] | null = null;

            for (const pArray of allPatientArrays) {
                const pIndex = pArray.findIndex(p => p.cpf?.replace(/[^\d]/g, '') === cpfToFind);
                if (pIndex > -1) {
                    targetPatient = pArray[pIndex];
                    patientIndex = pIndex;
                    patientArray = pArray;
                    patientFound = true;
                    break;
                }
            }

            if (patientFound && targetPatient && patientArray) {
                if (!targetPatient.visits) {
                    targetPatient.visits = [];
                }

                if (visitId) { // Edit existing visit
                    const visitIndex = targetPatient.visits.findIndex(v => v.id === visitId);
                    if (visitIndex > -1) {
                        targetPatient.visits[visitIndex].formData = visitFormData;
                        targetPatient.visits[visitIndex].registeredAt = new Date().toISOString();
                    } else {
                        return reject(`Visita com ID ${visitId} não encontrada para este paciente.`);
                    }
                } else { // Create new visit
                    const newVisit: Visit = {
                        id: Date.now().toString(),
                        registeredAt: new Date().toISOString(),
                        formData: visitFormData,
                    };
                    targetPatient.visits.push(newVisit);
                }
                // Atualiza o objeto do paciente no array
                patientArray[patientIndex] = { ...targetPatient };

            } else { // Patient not found, create a new one
                const newPatient: GeneralPatient = {
                    id: Date.now().toString(),
                    nome: visitFormData.nome || 'Nome não informado',
                    cpf: visitFormData.cpf,
                    cns: visitFormData.cns || '',
                    dataNascimento: visitFormData.dataNascimento || '',
                    telefone: visitFormData.telefone || '',
                    visits: [{
                        id: Date.now().toString() + '-visit',
                        registeredAt: new Date().toISOString(),
                        formData: visitFormData,
                    }]
                };
                currentDb.generalPatients.push(newPatient);
            }

            const dataToStore: DbData = {
                id: 'patientData',
                database: currentDb,
                loadedAt: new Date().toISOString(),
            };

            const putRequest = store.put(dataToStore);
            putRequest.onerror = () => reject('Erro ao salvar os dados da visita.');
            putRequest.onsuccess = () => resolve(currentDb);
        };
    });
};