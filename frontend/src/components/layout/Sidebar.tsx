import React from 'react';
import { LayoutDashboard, Radio, Map, Settings, Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Radio, label: 'Live Feed', path: '/feed' },
    { icon: Map, label: 'Map', path: '/map' },
    { icon: Activity, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar: React.FC = () => {
    const location = useLocation();

    return (
        <aside className="w-64 bg-panel border-r border-panel flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6 border-b border-panel flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <Activity className="text-white w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold text-primary">
                    RescuLens
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                                isActive
                                    ? 'bg-accent/10 text-accent shadow-lg shadow-accent/20'
                                    : 'text-secondary hover:bg-item-hover hover:text-primary'
                            )}
                        >
                            <item.icon
                                className={clsx(
                                    'w-5 h-5 transition-colors',
                                    isActive ? 'text-accent' : 'text-muted group-hover:text-secondary'
                                )}
                            />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-panel">
                <div className="bg-app/50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                            System Online
                        </span>
                    </div>
                    <p className="text-xs text-muted">Connected to HQ Dispatch</p>
                </div>
            </div>
        </aside>
    );
};
