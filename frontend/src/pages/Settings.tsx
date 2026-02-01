import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Smartphone, Volume2, Moon, Sun, Stethoscope, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../context/ThemeContext';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-panel border border-panel rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-panel bg-panel">
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
        </div>
        <div className="p-6 space-y-6">
            {children}
        </div>
    </div>
);

const Toggle: React.FC<{ label: string; description?: string; defaultChecked?: boolean }> = ({ label, description, defaultChecked }) => (
    <div className="flex items-center justify-between">
        <div>
            <p className="text-primary font-medium">{label}</p>
            {description && <p className="text-sm text-muted mt-0.5">{description}</p>}
        </div>
        <button className={clsx(
            "w-11 h-6 rounded-full transition-colors relative",
            defaultChecked ? "bg-accent" : "bg-slate-700"
        )}>
            <div className={clsx(
                "w-4 h-4 rounded-full bg-white absolute top-1 transition-transform",
                defaultChecked ? "left-6" : "left-1"
            )} />
        </button>
    </div>
);

const ThemeCard: React.FC<{
    theme: Theme;
    currentTheme: Theme;
    onClick: () => void;
    icon: React.ComponentType<any>;
    label: string;
}> = ({ theme, currentTheme, onClick, icon: Icon, label }) => (
    <div
        onClick={onClick}
        className={clsx(
            "p-4 rounded-xl border cursor-pointer transition-all duration-200",
            currentTheme === theme
                ? "bg-accent/10 border-accent"
                : "bg-panel border-panel hover:border-accent/50"
        )}
    >
        <Icon className={clsx(
            "w-5 h-5 mb-2",
            currentTheme === theme ? "text-accent" : "text-secondary"
        )} />
        <p className={clsx(
            "font-medium",
            currentTheme === theme ? "text-accent" : "text-primary"
        )}>{label}</p>
    </div>
);

export const Settings: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <Layout>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-primary mb-2">Settings</h2>
                <p className="text-secondary">Manage system configuration and preferences</p>
            </div>

            <div className="max-w-3xl">
                <Section title="Appearance">
                    <div className="grid grid-cols-3 gap-4">
                        <ThemeCard
                            theme="dark"
                            currentTheme={theme}
                            onClick={() => setTheme('dark')}
                            icon={Moon}
                            label="Dark Mode"
                        />
                        <ThemeCard
                            theme="light"
                            currentTheme={theme}
                            onClick={() => setTheme('light')}
                            icon={Sun}
                            label="Light Mode"
                        />
                        <ThemeCard
                            theme="medical"
                            currentTheme={theme}
                            onClick={() => setTheme('medical')}
                            icon={Stethoscope}
                            label="Medical"
                        />
                    </div>
                </Section>

                <Section title="Notifications & Alerts">
                    <Toggle
                        label="Critical Alerts"
                        description="Receive immediate browser notifications for CRITICAL incidents"
                        defaultChecked={true}
                    />
                    <Toggle
                        label="Sound Effects"
                        description="Play alert sound on new high-urgency incidents"
                        defaultChecked={true}
                    />
                    <Toggle
                        label="Email Summaries"
                        description="Daily digest of incident statistics"
                        defaultChecked={false}
                    />
                </Section>

                <Section title="System Integration">
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Smartphone className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-primary font-medium">Twilio Communication</p>
                                <p className="text-sm text-emerald-500">Connected</p>
                            </div>
                        </div>
                        <button className="text-sm text-secondary hover:text-primary px-3 py-1.5 border border-panel rounded-lg transition-colors hover:bg-item-hover">
                            Configure
                        </button>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Volume2 className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-primary font-medium">OpenAI Whisper</p>
                                <p className="text-sm text-emerald-500">Active</p>
                            </div>
                        </div>
                        <button className="text-sm text-secondary hover:text-primary px-3 py-1.5 border border-panel rounded-lg transition-colors hover:bg-item-hover">
                            Configure
                        </button>
                    </div>
                </Section>

                <Section title="General">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-panel rounded-xl border border-panel cursor-pointer hover:border-accent transition-colors">
                            <Globe className="w-5 h-5 text-accent mb-2" />
                            <p className="text-primary font-medium">Region</p>
                            <p className="text-xs text-muted">United States (EN)</p>
                        </div>
                    </div>
                </Section>
            </div>
        </Layout>
    );
};
