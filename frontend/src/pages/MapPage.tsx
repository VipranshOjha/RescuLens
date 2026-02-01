import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { LiveMap } from '../components/LiveMap';
import { api } from '../api/client';
import type { Incident } from '../api/client';
import { Activity } from 'lucide-react';

export const MapPage: React.FC = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchIncidents = async () => {
        try {
            const data = await api.getIncidents();
            setIncidents(data);
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
            <div className="h-[calc(100vh-8rem)] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-primary mb-1">Live Incident Map</h2>
                        <p className="text-secondary text-sm">Geospatial visualization of active emergencies</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-panel rounded-lg text-secondary border border-panel">
                        <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-medium">{incidents.length} Active Incidents</span>
                    </div>
                </div>

                {/* Independent resizing: MapPage uses full available height minus header */}
                <div className="flex-1 rounded-2xl overflow-hidden border border-panel relative z-0 h-[calc(100vh-160px)]">
                    <LiveMap incidents={incidents} />

                    {/* Legend Overlay */}
                    <div className="absolute top-6 right-6 z-[1000] bg-app/95 backdrop-blur shadow-lg border border-panel p-4 rounded-xl min-w-[200px]">
                        <h4 className="text-sm font-semibold text-primary mb-3">Map Legend</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-xs text-secondary">Critical Incident</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-orange-500" />
                                <span className="text-xs text-secondary">Urgent Incident</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span className="text-xs text-secondary">Non-Urgent</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
                                <span className="text-xs text-secondary">Hospital</span>
                            </div>
                            <div className="my-2 border-t border-panel" />
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-0.5 bg-red-500 border-t border-red-500 border-dashed" />
                                <span className="text-xs text-secondary">Critical Path</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-0.5 bg-blue-500 border-t border-blue-500 border-dashed" />
                                <span className="text-xs text-secondary">Standard Path</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
