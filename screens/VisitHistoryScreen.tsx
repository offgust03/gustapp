
import React, { useEffect, useState } from 'react';
import { getAllVisits } from '../services/dbService';
import { Patient, Visit } from '../data/patientDatabase';
import Card from '../components/Card';
import Loader from '../components/Loader';
import './VisitHistoryScreen.css';
import { ArrowLeftIcon } from '../components/Icons';

interface VisitHistoryScreenProps {
    patient: Patient | null;
    onBack: () => void;
    onEditVisit: (visit: Visit) => void;
}

const VisitHistoryScreen: React.FC<VisitHistoryScreenProps> = ({ patient, onBack, onEditVisit }) => {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                setLoading(true);
                if (patient) {
                    setVisits(patient.visits || []);
                } else {
                    const allVisits = await getAllVisits();
                    setVisits(allVisits);
                }
                setError(null);
            } catch (err) {
                setError('Erro ao carregar o histórico de visitas.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchVisits();
    }, [patient]);

    return (
        <div className="bg-white shadow-xl rounded-2xl p-6 md:p-10">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
                <button onClick={onBack} aria-label="Voltar" className="text-slate-500 hover:text-indigo-600 transition-colors p-2 -ml-2 rounded-full active:scale-95">
                    <ArrowLeftIcon />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Histórico de: {patient?.nome}</h2>
                    <p className="text-slate-600 mt-1">Total de {visits.length} registros encontrados.</p>
                </div>
            </div>

            {loading && <Loader />}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && visits.length === 0 && (
                <div className="text-center py-12 px-6 bg-slate-50 rounded-lg">
                    <h3 className="font-bold text-slate-800">Nenhuma Visita Registrada</h3>
                    <p className="text-slate-600 mt-2">Crie um novo registro para este paciente.</p>
                </div>
            )}
            {!loading && !error && visits.length > 0 && (
                <ul className="space-y-4">
                    {visits.map(visit => (
                        <li key={visit.id} className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <p className="font-bold text-slate-800">Visita de {new Date(visit.registeredAt).toLocaleDateString('pt-BR')}</p>
                                    <p className="text-sm text-slate-500">Registrado às {new Date(visit.registeredAt).toLocaleTimeString('pt-BR')}</p>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <button onClick={() => {}} className="text-sm bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors active:scale-95">Copiar</button>
                                    <button onClick={() => onEditVisit(visit)} className="text-sm bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors active:scale-95">Ver / Editar</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default VisitHistoryScreen;
