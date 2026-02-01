import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Incident } from '../api/client';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';
import { HOSPITALS, getHospitalByName } from '../data/hospitals';
import { renderToStaticMarkup } from 'react-dom/server';
import { AlertCircle, AlertTriangle, Info, CheckCircle, Hospital as HospitalIcon } from 'lucide-react';
import { getRoute } from '../api/routing';

// --- Custom Icon Factory ---
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
    CRITICAL: createMapIcon('#ef4444', AlertCircle, true), // Red, pulsing
    URGENT: createMapIcon('#f97316', AlertTriangle),       // Orange
    'NON-URGENT': createMapIcon('#eab308', Info),          // Yellow
    ADVICE: createMapIcon('#3b82f6', CheckCircle),         // Blue
    HOSPITAL: createMapIcon('#10b981', HospitalIcon)       // Emerald
};

interface LiveMapProps {
    incidents: Incident[];
}

export const LiveMap: React.FC<LiveMapProps> = ({ incidents }) => {
    // Default center
    const center: [number, number] = [23.2599, 77.4126];
    const { theme } = useTheme();
    const [routes, setRoutes] = useState<Record<string, [number, number][]>>({});

    const tileUrl = theme === 'dark'
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    // Helper to find assigned hospital from audit log
    const getAssignedHospital = (incident: Incident) => {
        // Look for dispatch events in logic
        const dispatchLog = incident.audit_log?.find(l =>
            l.event === "DISPATCH_RECOMMENDED" || l.event === "DISPATCH_CONFIRMED"
        );
        if (dispatchLog && dispatchLog.details && dispatchLog.details.hospital) {
            return getHospitalByName(dispatchLog.details.hospital);
        }
        return null;
    };

    // Fetch routes for assigned hospitals
    useEffect(() => {
        const fetchRoutes = async () => {
            const newRoutes: Record<string, [number, number][]> = {};
            let hasUpdates = false;

            for (const incident of incidents) {
                if (!incident.lat || !incident.lon) continue;

                const hospital = getAssignedHospital(incident);
                if (hospital) {
                    // Check if we already have a route or if it matches current cache
                    // Simple cache check: key by incidentID. 
                    // In real app, might want to check if loc changed.
                    if (!routes[incident.id]) {
                        try {
                            const path = await getRoute(
                                [incident.lat, incident.lon],
                                [hospital.lat, hospital.lon]
                            );
                            newRoutes[incident.id] = path;
                            hasUpdates = true;
                        } catch (e) {
                            console.error("Failed to load route for", incident.id);
                        }
                    }
                }
            }

            if (hasUpdates) {
                setRoutes(prev => ({ ...prev, ...newRoutes }));
            }
        };

        fetchRoutes();
    }, [incidents]); // Depend on incidents to trigger updates

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden border border-panel shadow-2xl relative z-0">
            <style>
                {`
                @keyframes ping {
                    75%, 100% { transform: scale(1.5); opacity: 0; }
                }
                `}
            </style>
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={tileUrl}
                />

                {/* Render Hospitals */}
                {HOSPITALS.map(hospital => (
                    <Marker
                        key={hospital.id}
                        position={[hospital.lat, hospital.lon]}
                        icon={Icons.HOSPITAL}
                    >
                        <Popup className="text-black">
                            <div className="p-2">
                                <h3 className="font-bold text-base">{hospital.name}</h3>
                                <p className="text-xs text-gray-500 mb-1">Available Beds: {hospital.beds}</p>
                                <div className="flex gap-1 flex-wrap">
                                    {hospital.capabilities.map(cap => (
                                        <span key={cap} className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded border border-emerald-200 uppercase">{cap}</span>
                                    ))}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Render Incidents */}
                {incidents.map((incident) => {
                    if (!incident.lat || !incident.lon) return null;

                    const hospital = getAssignedHospital(incident);
                    const urgency = incident.urgency as keyof typeof Icons;
                    const icon = Icons[urgency] || Icons.ADVICE;
                    const route = routes[incident.id];

                    return (
                        <React.Fragment key={incident.id}>
                            <Marker position={[incident.lat, incident.lon]} icon={icon}>
                                <Popup className="text-black">
                                    <div className="p-2 min-w-[200px]">
                                        <div className="flex items-center gap-2 mb-2 font-bold uppercase text-xs">
                                            <span className={`px-2 py-0.5 rounded border ${urgency === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-200' :
                                                urgency === 'URGENT' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                    'bg-blue-50 text-blue-600 border-blue-200'
                                                }`}>
                                                {incident.urgency}
                                            </span>
                                            <span className="text-gray-400">|</span>
                                            <span>{new Date(incident.created_at).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-sm font-medium mb-2">{incident.input_text}</p>
                                        {hospital && (
                                            <div className="text-xs pt-2 border-t border-gray-100 flex items-center gap-1 text-emerald-600 font-medium">
                                                <HospitalIcon size={12} />
                                                Routing to: {hospital.name}
                                            </div>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Draw Path to Hospital if assigned */}
                            {hospital && (
                                <Polyline
                                    positions={route || [
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
                        </React.Fragment>
                    );
                })}
            </MapContainer>
        </div>
    );
};
