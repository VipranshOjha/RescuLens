import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, MapPin } from 'lucide-react';
import type { Incident } from '../api/client';
import { clsx } from 'clsx';

interface IncidentCardProps {
    incident: Incident;
    onClick: (id: string) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onClick }) => {
    const isCritical = incident.urgency === 'CRITICAL';

    return (
        <motion.div
            layoutId={incident.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onClick(incident.id)}
            className={clsx(
                'cursor-pointer relative overflow-hidden rounded-2xl border p-5 transition-colors',
                isCritical
                    ? 'bg-red-950/10 border-red-500/20 hover:border-red-500/40'
                    : 'bg-panel border-panel hover:border-panel/80'
            )}
        >
            {/* Background Gradient for Critical */}
            {isCritical && (
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
            )}

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <span className={clsx(
                        'px-2.5 py-1 rounded-md text-xs font-bold tracking-wider uppercase border',
                        isCritical
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    )}>
                        {incident.urgency}
                    </span>
                    <span className="text-muted text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(incident.created_at).toLocaleTimeString()}
                    </span>
                </div>
                {incident.dispatch_required ? (
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                )}
            </div>

            <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-2 relative z-10">
                {incident.input_text}
            </h3>

            <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                {incident.symptoms.slice(0, 3).map((symptom, idx) => (
                    <span key={idx} className="px-2 py-1 bg-item-hover rounded text-xs text-secondary">
                        {symptom}
                    </span>
                ))}
                {incident.symptoms.length > 3 && (
                    <span className="px-2 py-1 bg-item-hover rounded text-xs text-secondary">
                        +{incident.symptoms.length - 3}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2 text-muted text-sm relative z-10 border-t border-panel/50 pt-3 mt-auto">
                <MapPin className="w-4 h-4" />
                <span>Location Detected (Simulated)</span>
            </div>
        </motion.div>
    );
};
