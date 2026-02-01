import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Incident } from '../api/client';
import { Layout } from '../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export const Feed: React.FC = () => {
    // ... existing hook code ...
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchIncidents = async () => {
        try {
            const data = await api.getIncidents();
            setIncidents(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } catch (error) {
            console.error("Failed to fetch incidents", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
        const interval = setInterval(fetchIncidents, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-primary mb-2">Live Incident Feed</h2>
                    <p className="text-secondary">All incoming emergency calls and triage status</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="Search incidents..."
                            className="bg-panel border border-panel rounded-lg pl-9 pr-4 py-2 text-sm text-primary focus:outline-none focus:border-accent w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-panel border border-panel rounded-lg text-secondary hover:text-primary transition-colors text-sm font-medium hover:bg-item-hover">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            <div className="bg-panel border border-panel rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-panel/80 border-b border-panel">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Incident</th>
                            <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Time</th>
                            <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Symptoms</th>
                            <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-panel">
                        {incidents.map((incident) => (
                            <tr key={incident.id} onClick={() => navigate(`/incidents/${incident.id}`)} className="hover:bg-item-hover transition-colors cursor-pointer group">
                                <td className="px-6 py-4">
                                    <span className={clsx(
                                        'px-2.5 py-1 rounded-md text-xs font-bold tracking-wider uppercase border',
                                        incident.urgency === 'CRITICAL'
                                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                    )}>
                                        {incident.urgency}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-primary font-medium line-clamp-1">{incident.input_text}</p>
                                    <p className="text-xs text-muted font-mono mt-0.5">{incident.id.slice(0, 8)}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-secondary">
                                    {new Date(incident.created_at).toLocaleTimeString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {incident.symptoms.slice(0, 2).map((s, i) => (
                                            <span key={i} className="text-xs px-2 py-0.5 bg-item-hover rounded text-secondary border border-panel">
                                                {s}
                                            </span>
                                        ))}
                                        {incident.symptoms.length > 2 && (
                                            <span className="text-xs px-1 py-0.5 text-muted">+{incident.symptoms.length - 2}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {incident.dispatch_confirmed ? (
                                        <span className="flex items-center gap-1.5 text-emerald-500 font-medium text-sm">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Confirmed
                                        </span>
                                    ) : incident.status === 'MANUAL_REVIEW_REQUESTED' ? (
                                        <span className="flex items-center gap-1.5 text-orange-500 font-medium text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            In Review
                                        </span>
                                    ) : incident.status === 'DISPATCH_DENIED' ? (
                                        <span className="flex items-center gap-1.5 text-red-500 font-medium text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            Denied
                                        </span>
                                    ) : incident.dispatch_required ? (
                                        <span className="flex items-center gap-1.5 text-red-500 font-medium text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            Pending
                                        </span>
                                    ) : (
                                        <span className="text-muted text-sm gap-1 flex items-center group-hover:text-primary transition-colors">
                                            Details <ChevronRight className="w-3 h-3" />
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {incidents.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-muted">
                                    No incidents found. Run a simulation to start.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};
