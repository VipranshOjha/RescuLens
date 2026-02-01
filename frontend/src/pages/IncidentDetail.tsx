import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Incident } from '../api/client';
import { Layout } from '../components/layout/Layout';
import { ArrowLeft, Clock, Activity, MapPin, Stethoscope, BrainCircuit } from 'lucide-react';
import { clsx } from 'clsx';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { HOSPITALS, getHospitalByName } from '../data/hospitals';
import { renderToStaticMarkup } from 'react-dom/server';
import { Polyline, Popup } from 'react-leaflet';
import { AlertCircle, AlertTriangle, Info, CheckCircle, Hospital as HospitalIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// --- Custom Icon Factory (Duplicate - consider extracting to utils) ---
const createMapIcon = (color: string, Icon: React.ElementType, pulse: boolean = false) => {
    return L.divIcon({
        className: 'custom-map-icon',
        html: renderToStaticMarkup(
            <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: color,
                    borderRadius: '50%',
                    opacity: pulse ? 0.4 : 0.2,
                    animation: pulse ? 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none'
                }} />
                <div style={{
                    position: 'relative',
                    width: '28px',
                    height: '28px',
                    backgroundColor: color,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }}>
                    <Icon size={16} color="white" strokeWidth={2.5} />
                </div>
            </div>
        ),
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
    });
};

const Icons = {
    CRITICAL: createMapIcon('#ef4444', AlertCircle, true),
    URGENT: createMapIcon('#f97316', AlertTriangle),
    'NON-URGENT': createMapIcon('#eab308', Info),
    ADVICE: createMapIcon('#3b82f6', CheckCircle),
    HOSPITAL: createMapIcon('#10b981', HospitalIcon)
};

export const IncidentDetail: React.FC = () => {
    // ... (existing code: hooks, etc)
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [incident, setIncident] = useState<Incident | null>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        if (!id) return;
        const fetchIncident = async () => {
            try {
                const data = await api.getIncident(id);
                setIncident(data);
            } catch (error) {
                console.error("Failed to fetch incident", error);
            } finally {
                setLoading(false);
            }
        };
        fetchIncident();
    }, [id]);

    const tileUrl = theme === 'dark'
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    // Helper to find assigned hospital from audit log
    const getAssignedHospital = (incident: Incident) => {
        const dispatchLog = incident.audit_log?.find(l =>
            l.event === "DISPATCH_RECOMMENDED" || l.event === "DISPATCH_CONFIRMED"
        );
        if (dispatchLog && dispatchLog.details && dispatchLog.details.hospital) {
            return getHospitalByName(dispatchLog.details.hospital);
        }
        return null;
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-full">
                    <Activity className="w-8 h-8 text-accent animate-spin" />
                </div>
            </Layout>
        );
    }

    if (!incident) {
        return (
            <Layout>
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-primary">Incident Not Found</h2>
                    <button onClick={() => navigate('/')} className="mt-4 text-accent hover:underline">
                        Return to Dashboard
                    </button>
                </div>
            </Layout>
        );
    }

    const isCritical = incident.urgency === 'CRITICAL';
    const hospital = getAssignedHospital(incident);
    const urgency = incident.urgency as keyof typeof Icons;
    const icon = Icons[urgency] || Icons.ADVICE;

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                {/* ... (Header and other sections remain unchanged) */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-secondary hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Feed
                </button>

                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={clsx(
                                'px-3 py-1 rounded-full text-sm font-bold tracking-wider uppercase border',
                                isCritical
                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            )}>
                                {incident.urgency}
                            </span>
                            <span className="text-muted flex items-center gap-1 text-sm">
                                <Clock className="w-4 h-4" />
                                {new Date(incident.created_at).toLocaleString()}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-primary mb-2">{incident.input_text}</h1>
                        <p className="text-secondary">Incident ID: {incident.id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* NLP Analysis */}
                        <div className="bg-panel border border-panel rounded-2xl p-6">
                            <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                                <Stethoscope className="w-5 h-5 text-accent" />
                                Medical Analysis
                            </h2>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {incident.symptoms.map((symptom, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-item-hover text-secondary rounded-lg text-sm border border-panel">
                                        {symptom}
                                    </span>
                                ))}
                            </div>

                            <div className="space-y-3">
                                {incident.reasoning.map((reason, idx) => (
                                    <div key={idx} className="flex gap-3 bg-item-hover p-4 rounded-xl border border-panel">
                                        <BrainCircuit className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                        <p className="text-secondary text-sm">{reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Audit Log */}
                        <div className="bg-panel border border-panel rounded-2xl p-6">
                            <h2 className="text-xl font-semibold text-primary mb-4">Audit Trail</h2>
                            <div className="space-y-4">
                                {incident.audit_log.map((log, idx) => (
                                    <div key={idx} className="flex gap-4 relative">
                                        <div className="w-px bg-panel absolute left-2.5 top-8 bottom-0" />
                                        <div className="w-5 h-5 rounded-full bg-panel border border-panel shrink-0 z-10" />
                                        <div>
                                            <p className="text-primary font-medium">{log.event}</p>
                                            <p className="text-muted text-xs">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                            <pre className="text-xs text-muted mt-1 font-mono overflow-x-auto">
                                                {JSON.stringify(log.details, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        {/* Map Preview */}
                        <div className="bg-panel border border-panel rounded-2xl p-1 overflow-hidden h-64">
                            {incident.lat && incident.lon ? (
                                <MapContainer center={[incident.lat, incident.lon]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false}>
                                    <style>
                                        {`
                                        @keyframes ping {
                                            75%, 100% { transform: scale(1.5); opacity: 0; }
                                        }
                                        `}
                                    </style>
                                    <TileLayer
                                        url={tileUrl}
                                    />

                                    {/* All Hospitals Context */}
                                    {HOSPITALS.map(h => (
                                        <Marker
                                            key={h.id}
                                            position={[h.lat, h.lon]}
                                            icon={Icons.HOSPITAL}
                                        >
                                            <Popup className="text-black">{h.name}</Popup>
                                        </Marker>
                                    ))}

                                    {/* Incident Marker */}
                                    <Marker position={[incident.lat, incident.lon]} icon={icon} key={incident.id} />

                                    {/* Path Line */}
                                    {hospital && (
                                        <Polyline
                                            positions={[
                                                [incident.lat, incident.lon],
                                                [hospital.lat, hospital.lon]
                                            ]}
                                            pathOptions={{
                                                color: urgency === 'CRITICAL' ? '#ef4444' : '#3b82f6',
                                                weight: 3,
                                                dashArray: '5, 10',
                                                opacity: 0.6
                                            }}
                                        />
                                    )}
                                </MapContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted text-sm">
                                    <MapPin className="w-6 h-6 mb-2 mx-auto opacity-50" />
                                    No location data
                                </div>
                            )}
                        </div>

                        {/* Action Panel */}
                        <div className="bg-panel border border-panel rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-primary mb-4">Dispatch Actions</h3>
                            <button
                                onClick={async () => {
                                    if (!incident) return;
                                    try {
                                        await api.confirmDispatch(incident.id);
                                        // Refresh incident data
                                        const updated = await api.getIncident(incident.id);
                                        setIncident(updated);
                                    } catch (e) {
                                        console.error("Dispatch failed", e);
                                    }
                                }}
                                disabled={incident.dispatch_confirmed}
                                className={clsx(
                                    "w-full py-3 text-white rounded-xl font-medium mb-3 transition-colors",
                                    incident.dispatch_confirmed
                                        ? "bg-emerald-600 hover:bg-emerald-700 cursor-default"
                                        : "bg-accent hover:bg-accent-hover"
                                )}>
                                {incident.dispatch_confirmed ? "Dispatch Confirmed" : "Confirm Dispatch"}
                            </button>
                            <button
                                onClick={async () => {
                                    if (!incident) return;
                                    try {
                                        await api.requestManualReview(incident.id);
                                        const updated = await api.getIncident(incident.id);
                                        setIncident(updated);
                                    } catch (e) {
                                        console.error("Manual review request failed", e);
                                    }
                                }}
                                disabled={incident.status === "MANUAL_REVIEW_REQUESTED" || incident.dispatch_confirmed}
                                className={clsx(
                                    "w-full py-3 bg-panel hover:bg-item-hover text-secondary rounded-xl font-medium transition-colors border border-panel",
                                    incident.status === "MANUAL_REVIEW_REQUESTED" && "opacity-50 cursor-not-allowed"
                                )}>
                                {incident.status === "MANUAL_REVIEW_REQUESTED" ? "Review Requested" : "Request Manual Review"}
                            </button>
                            <button
                                onClick={async () => {
                                    if (!incident) return;
                                    try {
                                        await api.denyDispatch(incident.id);
                                        const updated = await api.getIncident(incident.id);
                                        setIncident(updated);
                                    } catch (e) {
                                        console.error("Dispatch denial failed", e);
                                    }
                                }}
                                disabled={incident.status === "DISPATCH_DENIED"}
                                className={clsx(
                                    "w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-medium transition-colors border border-red-500/20 mt-3",
                                    incident.status === "DISPATCH_DENIED" && "opacity-50 cursor-not-allowed"
                                )}>
                                {incident.status === "DISPATCH_DENIED" ? "Dispatch Denied" : "Deny Dispatch"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
