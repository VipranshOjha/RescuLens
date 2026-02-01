import React, { useEffect, useState, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { api } from '../api/client';
import type { Incident } from '../api/client';
import { Activity, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

export const Analytics: React.FC = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const { theme } = useTheme();

    useEffect(() => {
        api.getIncidents().then(setIncidents).catch(console.error);
    }, []);

    // Derived stats
    const totalIncidents = incidents.length;
    const criticalCount = incidents.filter(i => i.urgency === 'CRITICAL').length;
    const dispatchCount = incidents.filter(i => i.dispatch_required).length;

    // Charts Data Preparation
    const severityData = useMemo(() => {
        const counts = { CRITICAL: 0, URGENT: 0, 'NON-URGENT': 0, ADVICE: 0 };
        incidents.forEach(i => {
            const urgency = i.urgency || 'NON-URGENT';
            if (urgency in counts) counts[urgency as keyof typeof counts]++;
            else counts['NON-URGENT']++;
        });

        return [
            { name: 'Critical', value: counts.CRITICAL, color: '#ef4444' },
            { name: 'Urgent', value: counts.URGENT, color: '#f97316' },
            { name: 'Non-Urgent', value: counts['NON-URGENT'], color: '#eab308' },
            { name: 'Advice', value: counts.ADVICE, color: '#3b82f6' },
        ].filter(d => d.value > 0);
    }, [incidents]);

    const timeData = useMemo(() => {
        // Group by hour (last 24h usually, but for demo we just group by existing timestamps)
        const groups: Record<string, number> = {};
        incidents.forEach(i => {
            const date = new Date(i.created_at);
            const hour = date.getHours();
            const label = `${hour}:00`;
            groups[label] = (groups[label] || 0) + 1;
        });

        // Fill in gaps if needed, or just sort logic
        return Object.entries(groups).map(([time, count]) => ({ time, count })).sort((a, b) => parseInt(a.time) - parseInt(b.time));
    }, [incidents]);

    return (
        <Layout>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-primary mb-2">System Analytics</h2>
                <p className="text-secondary">Performance metrics and incident trends</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-panel border border-panel p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-secondary text-sm font-medium">Total Volume</h3>
                        <Activity className="w-5 h-5 text-indigo-400" />
                    </div>
                    <p className="text-3xl font-bold text-primary">{totalIncidents}</p>
                    <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Live Updates
                    </div>
                </div>

                <div className="bg-panel border border-panel p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-secondary text-sm font-medium">Critical Cases</h3>
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-primary">{criticalCount}</p>
                    <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full" style={{ width: `${(criticalCount / (totalIncidents || 1)) * 100}%` }} />
                    </div>
                </div>

                <div className="bg-panel border border-panel p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-secondary text-sm font-medium">Avg Response Time</h3>
                        <Clock className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-3xl font-bold text-primary">1m 42s</p>
                    <p className="text-xs text-muted mt-2">Target: &lt; 2m 00s</p>
                </div>

                <div className="bg-panel border border-panel p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-secondary text-sm font-medium">Auto-Dispatch</h3>
                        <Activity className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-3xl font-bold text-primary">{Math.round((dispatchCount / (totalIncidents || 1)) * 100)}%</p>
                    <p className="text-xs text-muted mt-2">Efficiency Rating</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Volume Chart */}
                <div className="bg-panel border border-panel p-6 rounded-2xl h-96">
                    <h3 className="text-lg font-semibold text-primary mb-6">Incident Volume by Hour</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="time" stroke="#9ca3af" tickMargin={10} axisLine={false} tickLine={false} />
                            <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#374151', borderRadius: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Severity Chart */}
                <div className="bg-panel border border-panel p-6 rounded-2xl h-96">
                    <h3 className="text-lg font-semibold text-primary mb-6">Severity Distribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={severityData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {severityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#374151', borderRadius: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '20px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Layout>
    );
};
