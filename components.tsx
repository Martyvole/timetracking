
import React, { useState, useRef, useMemo } from 'react';
import type { Project, TimeEntry, Screen, User } from './types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Icon Components ---

const Icon: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}>
        {children}
    </svg>
);

export const AppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`relative w-24 h-24 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#00F5FF] via-[#9D4EDD] to-[#FF0080] rounded-[28px] blur-lg opacity-50"></div>
        <div className="relative w-full h-full bg-[rgba(20,20,35,0.8)] backdrop-blur-md rounded-[24px] border border-white/10 flex items-center justify-center">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="iconGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#00F5FF"/>
                        <stop offset="50%" stopColor="#9D4EDD"/>
                        <stop offset="100%" stopColor="#FF0080"/>
                    </linearGradient>
                </defs>
                <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20Z" fill="url(#iconGrad)" fillOpacity="0.5"/>
                <path d="M12 6V12L16 14" stroke="url(#iconGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    </div>
);

export const TimerIcon: React.FC = () => <Icon><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-1 4v5h5v-2h-3V8H11Z" /></Icon>;
export const StatsIcon: React.FC = () => <Icon><path d="M3 12h2v9H3v-9Zm5-4h2v13H8V8Zm5-5h2v18h-2V3Zm5 9h2v9h-2v-9Z" /></Icon>;
export const ProjectsIcon: React.FC = () => <Icon><path d="M3 4c0-.552.448-1 1-1h16c.552 0 1 .448 1 1v16c0 .552-.448 1-1 1H4c-.552 0-1-.448-1-1V4Zm2 1v14h14V5H5Zm2 2h4v4H7V7Zm6 0h4v4h-4V7Zm-6 6h4v4H7v-4Zm6 0h4v4h-4v-4Z"/></Icon>;
export const SettingsIcon: React.FC = () => <Icon><path d="M12 1a9 9 0 0 0-6.12 15.65.75.75 0 0 1-.22 1.05l-1.59 1.59a.75.75 0 0 0 1.06 1.06l1.59-1.59a.75.75 0 0 1 1.05-.22A9 9 0 1 0 12 1Zm0 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" clipRule="evenodd" fillRule="evenodd"/></Icon>;
export const HistoryIcon: React.FC = () => <Icon><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8Zm1-12h-2v5h5v-2h-3V8Z" clipRule="evenodd" fillRule="evenodd" /></Icon>;
export const PlayIcon: React.FC = () => <Icon><path d="M8 5.14v14l11-7-11-7Z" /></Icon>;
export const PauseIcon: React.FC = () => <Icon><path d="M6 5h4v14H6V5Zm8 0h4v14h-4V5Z" /></Icon>;
export const StopIcon: React.FC = () => <Icon><path d="M6 6h12v12H6V6Z" /></Icon>;
export const PlusIcon: React.FC = () => <Icon><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6Z" /></Icon>;
export const KebabMenuIcon: React.FC = () => <Icon><path d="M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></Icon>;
export const EditIcon: React.FC = () => <Icon><path d="m16.262 3.126 4.612 4.612-11.88 11.88-5.717 1.117 1.117-5.717L16.262 3.126ZM18.429 1.943l-2.167 2.167-4.612-4.612 2.167-2.167a1 1 0 0 1 1.414 0l3.198 3.198a1 1 0 0 1 0 1.414Z"/></Icon>;
export const TrashIcon: React.FC = () => <Icon><path d="M4 6h16v2H4V6Zm2 14v-9h12v9H6Zm2-7h2v5H8v-5Zm4 0h2v5h-2v-5Zm-6-5h10V4H8v2Z"/></Icon>;


// --- UI Components ---

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-glass backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden ${className}`}>
        {children}
    </div>
);

export const FloatingButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string, ariaLabel: string }> = ({ onClick, children, className, ariaLabel }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        className={`relative group flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95 ${className}`}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00F5FF] via-[#9D4EDD] to-[#FF0080] rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 opacity-60 group-hover:opacity-80"></div>
        <div className="relative w-full h-full bg-gradient-to-br from-[rgba(0,245,255,0.8)] via-[rgba(157,78,221,0.8)] to-[rgba(255,0,128,0.8)] text-white rounded-full flex items-center justify-center shadow-lg">
            {children}
        </div>
    </button>
);

interface BottomNavProps {
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
    onHapticTrigger: () => void;
    t: (key: string) => string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen, onHapticTrigger, t }) => {
    const navItems: { screen: Screen, icon: React.ReactNode, labelKey: 'timer' | 'history' | 'stats' | 'projects' | 'settings' }[] = [
        { screen: 'timer', icon: <TimerIcon />, labelKey: 'timer' },
        { screen: 'history', icon: <HistoryIcon />, labelKey: 'history' },
        { screen: 'stats', icon: <StatsIcon />, labelKey: 'stats' },
        { screen: 'projects', icon: <ProjectsIcon />, labelKey: 'projects' },
        { screen: 'settings', icon: <SettingsIcon />, labelKey: 'settings' },
    ];

    const handleNavClick = (screen: Screen) => {
        setActiveScreen(screen);
        onHapticTrigger();
    };

    return (
        <GlassCard className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm mx-auto mb-3 z-50">
            <div className="flex justify-around items-center h-20 px-2">
                {navItems.map(item => (
                    <button
                        key={item.screen}
                        onClick={() => handleNavClick(item.screen)}
                        className={`relative flex flex-col items-center justify-center w-1/5 h-full text-xs transition-colors duration-300 rounded-2xl ${
                            activeScreen === item.screen ? 'text-[#00F5FF]' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {activeScreen === item.screen && (
                            <span className="absolute inset-0 bg-white/5 rounded-2xl -z-10"></span>
                        )}
                        <div className={`transition-transform duration-300 ${activeScreen === item.screen ? 'scale-110 -translate-y-1' : ''}`}>
                            {item.icon}
                        </div>
                        <span className={`mt-1 font-semibold transition-opacity duration-300 ${activeScreen === item.screen ? 'opacity-100' : 'opacity-70'}`}>
                            {t(item.labelKey)}
                        </span>
                    </button>
                ))}
            </div>
        </GlassCard>
    );
};

export const OfflineIndicator: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 w-auto px-4 py-2 bg-red-500/50 backdrop-blur-md border border-red-500/80 rounded-full z-[60] text-white text-sm font-semibold animate-pulse">
        {t('offline')}
    </div>
);


// --- Feature Components ---

interface TimerDisplayProps {
    elapsedTime: number;
    earnings: number;
    activeProject?: Project;
    currency: string;
    isActive: boolean;
    t: (key: string) => string;
    language: 'en' | 'cs';
}
export const TimerDisplay: React.FC<TimerDisplayProps> = ({ elapsedTime, earnings, activeProject, currency, isActive, t, language }) => {
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (Math.floor(seconds) % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };
    
    const formatCurrency = (amount: number) => {
         return new Intl.NumberFormat(language === 'cs' ? 'cs-CZ' : 'en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(amount);
    }

    const radius = 130;
    const circumference = 2 * Math.PI * radius;
    const progress = (elapsedTime % 60) / 60;

    return (
        <div className="relative flex flex-col items-center justify-center w-[300px] h-[300px] md:w-[350px] md:h-[350px] drop-shadow-[0_0_25px_var(--glow)]">
             <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 300 300">
                <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                         <stop offset="0%" stopColor="var(--accent-1)" />
                         <stop offset="100%" stopColor="var(--accent-3)" />
                    </linearGradient>
                     <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {/* Dial background and inner shadow for 3D depth */}
                <circle cx="150" cy="150" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="rgba(10, 10, 21, 0.5)" />
                <circle cx="150" cy="150" r={radius - 1} fill="transparent" stroke="rgba(0,0,0,0.5)" strokeWidth="15" />

                {/* The glowing progress bar */}
                <g filter="url(#neonGlow)">
                    <circle
                        cx="150"
                        cy="150"
                        r={radius}
                        stroke="url(#timerGradient)"
                        strokeWidth="8"
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress * circumference}
                        className={isActive ? "transition-[stroke-dashoffset] duration-1000 ease-linear" : ""}
                    />
                </g>
            </svg>
            <div className="z-10 flex flex-col items-center">
                <p 
                    className="font-timer text-6xl md:text-7xl font-thin tracking-tighter text-white"
                    style={{ textShadow: '0 0 10px var(--glow), 0 0 20px var(--soft-glow)'}}
                >
                    {formatTime(elapsedTime)}
                </p>
                <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD]">
                    {formatCurrency(earnings)}
                </p>
                 <p className="mt-2 text-gray-400 text-sm truncate max-w-[200px]">{activeProject ? activeProject.name : t('noProjectSelected')}</p>
            </div>
        </div>
    );
};

interface StatsDashboardProps {
    entries: TimeEntry[];
    projects: Project[];
    hourlyRate: number;
    currency: string;
    userName?: string;
    t: (key: string, ...args: any[]) => string;
    language: 'en' | 'cs';
    isAdmin: boolean;
    allUsers: User[];
    adminView: string;
    setAdminView: (view: string) => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ entries, projects, hourlyRate, currency, userName, t, language, isAdmin, allUsers, adminView, setAdminView }) => {
    const dataByDay: { [key: string]: { name: string, hours: number } } = {};
    const today = new Date();

    for(let i=6; i>=0; i--){
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayKey = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
        const dayName = d.toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', { weekday: 'short' });
        dataByDay[dayKey] = { name: dayName, hours: 0 };
    }

    entries.forEach(entry => {
        const entryDate = new Date(entry.startTime).toLocaleDateString('en-CA');
        if(dataByDay[entryDate]) {
            dataByDay[entryDate].hours += entry.duration / 3600;
        }
    });

    const chartData = Object.values(dataByDay);

    const totalHours = entries.reduce((acc, e) => acc + e.duration, 0) / 3600;
    const totalEarnings = totalHours * hourlyRate;

    const formatCurrency = (amount: number) => {
         return new Intl.NumberFormat(language === 'cs' ? 'cs-CZ' : 'en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(amount);
    }

    return (
        <div className="p-4 space-y-6 text-white">
            <h2 className="font-display text-4xl font-extrabold text-center">{t('statistics')}</h2>
            {userName && <p className="text-center text-gray-400 -mt-4">{t('forUser', userName)}</p>}
            
            {isAdmin && (
                 <GlassCard className="p-4">
                     <select 
                        value={adminView}
                        onChange={(e) => setAdminView(e.target.value)}
                        className="w-full p-3 bg-white/5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#00F5FF] appearance-none text-center font-bold"
                     >
                        <option value="all">{t('allUsers')}</option>
                        {allUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                     </select>
                 </GlassCard>
            )}

            <div className="grid grid-cols-2 gap-4 text-center">
                <GlassCard className="p-4">
                    <p className="text-gray-400 text-sm">{t('totalHours')}</p>
                    <p className="text-3xl font-bold font-timer">{totalHours.toFixed(1)}</p>
                </GlassCard>
                <GlassCard className="p-4">
                     <p className="text-gray-400 text-sm">{t('totalEarnings')}</p>
                    <p className="text-3xl font-bold font-timer">{formatCurrency(totalEarnings)}</p>
                </GlassCard>
            </div>
            
            <GlassCard className="p-4 h-64">
                <h3 className="text-lg font-bold mb-4 ml-2">{t('weeklyHours')}</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 20 }}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(20, 20, 35, 0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                color: 'white'
                            }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }}
                        />
                        <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="url(#colorUv)" />
                            ))}
                        </Bar>
                         <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#9D4EDD" stopOpacity={0.8}/>
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </GlassCard>
        </div>
    );
};

const PROJECT_COLORS = ['#00F5FF', '#FF0080', '#9D4EDD', '#38E4AE', '#FFC700', '#FF6B00'];

interface ProjectListProps {
    projects: Project[];
    onSelectProject: (projectId: string) => void;
    activeProjectId?: string;
    onCreateProject: () => void;
    onEditProject: (project: Project) => void;
    onDeleteProject: (projectId: string) => void;
    onHapticTrigger: (type: 'light' | 'medium' | 'error') => void;
    t: (key: string) => string;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject, activeProjectId, onCreateProject, onEditProject, onDeleteProject, onHapticTrigger, t }) => {
    const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

    const toggleMenu = (projectId: string) => {
        onHapticTrigger('light');
        setMenuOpenFor(prev => (prev === projectId ? null : projectId));
    };
    
    return (
        <div className="p-4 space-y-4 text-white relative h-full flex flex-col">
            <h2 className="font-display text-4xl font-extrabold text-center">{t('projectsTitle')}</h2>
            <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <p className="text-lg">{t('noProjects')}</p>
                        <p className="text-sm">{t('noProjectsDesc')}</p>
                    </div>
                ) : projects.map(p => (
                    <div key={p.id} className="relative">
                        <GlassCard className={`w-full transition-all duration-300 flex items-center justify-between ${activeProjectId === p.id ? 'border-[#00F5FF] shadow-[0_0_20px_var(--glow)]' : ''}`}>
                            <button onClick={() => onSelectProject(p.id)} className="flex-grow flex items-center gap-4 p-4 text-left">
                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: p.color}}></div>
                                <span className="font-bold">{p.name}</span>
                                {activeProjectId === p.id && <div className="w-2 h-2 rounded-full bg-[#00F5FF] ml-auto"></div>}
                            </button>
                             <button onClick={() => toggleMenu(p.id)} className="p-4 text-gray-400 hover:text-white">
                                <KebabMenuIcon />
                            </button>
                        </GlassCard>
                        {menuOpenFor === p.id && (
                             <GlassCard className="absolute right-0 top-full mt-2 w-40 z-10 p-2">
                                 <button onClick={() => { onEditProject(p); setMenuOpenFor(null); }} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-white/5">
                                    <EditIcon /> {t('edit')}
                                 </button>
                                 <button onClick={() => { onDeleteProject(p.id); setMenuOpenFor(null); }} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-red-500">
                                     <TrashIcon /> {t('delete')}
                                 </button>
                             </GlassCard>
                        )}
                    </div>
                ))}
            </div>
             <FloatingButton onClick={onCreateProject} ariaLabel={t('addProject')} className="absolute bottom-4 right-4 w-16 h-16">
                <PlusIcon />
             </FloatingButton>
        </div>
    );
};

interface ProjectModalProps {
    project?: Project | null;
    onClose: () => void;
    onSave: (projectData: { name: string, color: string }) => void;
    t: (key: string) => string;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onSave, t }) => {
    const isEditing = !!project;
    const [name, setName] = useState(project?.name || '');
    const [color, setColor] = useState(project?.color || PROJECT_COLORS[0]);

    const handleSave = () => {
        if (name.trim()) {
            onSave({ name, color });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-sm p-6 space-y-6">
                <h2 className="font-display text-2xl font-bold text-center">{isEditing ? t('editProject') : t('newProject')}</h2>
                <div>
                    <label htmlFor="projectName" className="text-sm text-gray-400">{t('projectName')}</label>
                    <input
                        id="projectName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full mt-1 p-3 bg-white/5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#00F5FF]"
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-400">{t('color')}</label>
                    <div className="flex justify-between mt-2">
                        {PROJECT_COLORS.map(c => (
                            <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-[#0A0A15] ring-white' : ''}`} style={{ backgroundColor: c }}></button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-4">
                     <button onClick={onClose} className="flex-1 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">{t('cancel')}</button>
                     <FloatingButton onClick={handleSave} ariaLabel={t('save')} className="flex-1 h-12">
                        <span className="font-bold">{t('save')}</span>
                     </FloatingButton>
                </div>
            </GlassCard>
        </div>
    );
};

interface SettingsScreenProps {
    hourlyRate: number;
    setHourlyRate: (rate: number) => void;
    currency: string;
    setCurrency: (currency: string) => void;
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onReset: () => void;
    currentUser?: User;
    onSwitchUser: () => void;
    t: (key: string) => string;
    language: 'en' | 'cs';
    setLanguage: (lang: 'en' | 'cs') => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ hourlyRate, setHourlyRate, currency, setCurrency, onExport, onImport, onReset, currentUser, onSwitchUser, t, language, setLanguage }) => {
    const importRef = useRef<HTMLInputElement>(null);

    return (
        <div className="p-4 space-y-6 text-white">
            <h2 className="font-display text-4xl font-extrabold text-center">{t('settingsTitle')}</h2>
            
            {currentUser && (
                <GlassCard className="p-6 space-y-4">
                    <h3 className="font-bold text-lg text-gray-300">{t('userProfile')}</h3>
                    <div className="flex items-center justify-between">
                        <p>{t('loggedInAs')} <span className="font-bold text-[#00F5FF]">{currentUser.name}</span></p>
                        <button onClick={onSwitchUser} className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors font-semibold">{t('switchUser')}</button>
                    </div>
                </GlassCard>
            )}

            <GlassCard className="p-6 space-y-4">
                <h3 className="font-bold text-lg text-gray-300">{t('general')}</h3>
                 <div>
                    <label htmlFor="hourlyRate" className="text-sm text-gray-400">{t('hourlyRate')}</label>
                    <input
                        id="hourlyRate"
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="w-full mt-1 p-3 bg-white/5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#00F5FF]"
                    />
                </div>
                 <div>
                    <label htmlFor="currency" className="text-sm text-gray-400">{t('currencySymbol')}</label>
                    <input
                        id="currency"
                        type="text"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                        className="w-full mt-1 p-3 bg-white/5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#00F5FF]"
                    />
                </div>
            </GlassCard>
            
            <GlassCard className="p-6 space-y-4">
                <h3 className="font-bold text-lg text-gray-300">{t('language')}</h3>
                <div className="flex gap-4">
                    <button onClick={() => setLanguage('en')} className={`flex-1 p-3 rounded-full font-semibold transition-colors ${language === 'en' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}>English</button>
                    <button onClick={() => setLanguage('cs')} className={`flex-1 p-3 rounded-full font-semibold transition-colors ${language === 'cs' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}>Čeština</button>
                </div>
            </GlassCard>

             <GlassCard className="p-6 space-y-4">
                 <h3 className="font-bold text-lg text-gray-300">{t('dataManagement')}</h3>
                 <div className="flex gap-4">
                     <button onClick={onExport} className="flex-1 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors font-semibold">{t('exportData')}</button>
                     <button onClick={() => importRef.current?.click()} className="flex-1 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors font-semibold">{t('importData')}</button>
                     <input type="file" ref={importRef} onChange={onImport} accept=".json" className="hidden" />
                 </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-4 border-red-500/50">
                 <h3 className="font-bold text-lg text-red-400">{t('dangerZone')}</h3>
                 <p className="text-sm text-gray-400">{t('dangerZoneDesc')}</p>
                 <button onClick={onReset} className="w-full p-3 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 transition-colors font-bold">
                    {t('resetAllData')}
                </button>
            </GlassCard>
        </div>
    );
};

interface UserSelectionScreenProps {
    users: User[];
    onSelectUser: (userId: string) => void;
    onCreateUser: (name: string) => void;
    t: (key: string) => string;
}

export const UserSelectionScreen: React.FC<UserSelectionScreenProps> = ({ users, onSelectUser, onCreateUser, t }) => {
    const [newUserName, setNewUserName] = useState('');

    const handleCreate = () => {
        if (newUserName.trim()) {
            onCreateUser(newUserName.trim());
            setNewUserName('');
        }
    };

    return (
        <div className="w-full h-full bg-gradient-to-b from-[#000010] to-[#0A0A15] flex flex-col items-center justify-center p-8 text-white">
            <AppIcon className="w-32 h-32 mb-8" />
            <h1 className="font-display text-4xl font-extrabold mb-2">{t('welcome')}</h1>
            <h2 className="font-display text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD] mb-12">FlowTime Pro</h2>

            <GlassCard className="w-full max-w-sm p-6 space-y-4">
                <h3 className="text-xl font-bold text-center">{t('selectOrCreateProfile')}</h3>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                    {users.map(user => (
                        <button key={user.id} onClick={() => onSelectUser(user.id)} className="w-full p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors font-semibold">
                            {user.name}
                        </button>
                    ))}
                </div>

                <div className="pt-4 border-t border-white/10">
                    <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder={t('enterNewUserName')}
                        className="w-full p-3 bg-white/5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#00F5FF]"
                    />
                    <FloatingButton onClick={handleCreate} ariaLabel={t('createUser')} className="w-full h-12 mt-4">
                        <span className="font-bold">{t('createUser')}</span>
                    </FloatingButton>
                </div>
            </GlassCard>
        </div>
    );
}

// --- History Components ---

const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    let str = '';
    if (h > 0) str += `${h}h `;
    if (m > 0 || h > 0) str += `${m}m`;
    return str.trim() || '0m';
};

const formatTime = (timestamp: number, locale: string) => new Date(timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

const groupEntriesByDate = (entries: TimeEntry[]) => {
    return entries
        .sort((a, b) => b.startTime - a.startTime)
        .reduce((acc, entry) => {
            const entryDate = new Date(entry.startTime);
            const key = entryDate.toDateString();
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(entry);
            return acc;
        }, {} as Record<string, TimeEntry[]>);
};

interface TimeEntryListScreenProps {
    entries: TimeEntry[];
    projects: Project[];
    onAdd: () => void;
    onEdit: (entry: TimeEntry) => void;
    onDelete: (entryId: string) => void;
    onHapticTrigger: (type: 'light' | 'medium' | 'error') => void;
    t: (key: string) => string;
    language: 'en' | 'cs';
}

export const TimeEntryListScreen: React.FC<TimeEntryListScreenProps> = ({ entries, projects, onAdd, onEdit, onDelete, onHapticTrigger, t, language }) => {
    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);
    const groupedEntries = useMemo(() => groupEntriesByDate(entries), [entries]);

    const formatDateHeader = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return t('today');
        if (date.toDateString() === yesterday.toDateString()) return t('yesterday');

        return date.toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="p-4 space-y-4 text-white relative h-full flex flex-col">
            <h2 className="font-display text-4xl font-extrabold text-center">{t('historyTitle')}</h2>
            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                {entries.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <p className="text-lg">{t('noTimeEntries')}</p>
                        <p className="text-sm">{t('noTimeEntriesDesc')}</p>
                    </div>
                ) : (
                    Object.entries(groupedEntries).map(([dateKey, entriesOnDate]) => (
                        <div key={dateKey}>
                            <h3 className="font-bold text-gray-400 mb-2 px-4">{formatDateHeader(dateKey)}</h3>
                            <div className="space-y-3">
                                {entriesOnDate.map(entry => {
                                    const project = projectMap.get(entry.projectId);
                                    return (
                                        <GlassCard key={entry.id} className="p-4 flex items-center gap-4">
                                            <div className="w-2 h-10 rounded-full" style={{ backgroundColor: project?.color || '#888' }}></div>
                                            <div className="flex-grow">
                                                <p className="font-bold">{project?.name || t('unknownProject')}</p>
                                                <p className="text-sm text-gray-400">
                                                    {formatTime(entry.startTime, language)} - {entry.endTime ? formatTime(entry.endTime, language) : '...'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold font-timer text-lg">{formatDuration(entry.duration)}</p>
                                                 <div className="flex gap-2 mt-1">
                                                    <button onClick={() => { onHapticTrigger('light'); onEdit(entry); }} className="text-gray-400 hover:text-white"><EditIcon /></button>
                                                    <button onClick={() => { onHapticTrigger('light'); onDelete(entry.id); }} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                                                 </div>
                                            </div>
                                        </GlassCard>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
             <FloatingButton onClick={onAdd} ariaLabel={t('addEntry')} className="absolute bottom-4 right-4 w-16 h-16">
                <PlusIcon />
             </FloatingButton>
        </div>
    );
};

interface TimeEntryModalProps {
    entry?: TimeEntry | null;
    projects: Project[];
    onClose: () => void;
    onSave: (entryData: { projectId: string; startTime: number; endTime: number }) => void;
    t: (key: string) => string;
}

const toISODate = (timestamp: number) => new Date(timestamp).toISOString().split('T')[0];
const toISOTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export const TimeEntryModal: React.FC<TimeEntryModalProps> = ({ entry, projects, onClose, onSave, t }) => {
    const isEditing = !!entry;
    const now = Date.now();
    
    const [projectId, setProjectId] = useState(entry?.projectId || projects[0]?.id || '');
    const [startDate, setStartDate] = useState(toISODate(entry?.startTime || now));
    const [startTime, setStartTime] = useState(toISOTime(entry?.startTime || now));
    const [endDate, setEndDate] = useState(toISODate(entry?.endTime || now));
    const [endTime, setEndTime] = useState(toISOTime(entry?.endTime || now));
    
    const handleSave = () => {
        if (!projectId) {
            alert(t('selectProject'));
            return;
        }

        const startTimestamp = new Date(`${startDate}T${startTime}`).getTime();
        const endTimestamp = new Date(`${endDate}T${endTime}`).getTime();

        if (startTimestamp >= endTimestamp) {
            alert(t('endTimeAfterStart'));
            return;
        }
        
        onSave({ projectId, startTime: startTimestamp, endTime: endTimestamp });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-sm p-6 space-y-6 text-white">
                <h2 className="font-display text-2xl font-bold text-center">{isEditing ? t('editEntry') : t('newEntry')}</h2>
                
                <div>
                    <label htmlFor="entryProject" className="text-sm text-gray-400">{t('project')}</label>
                    <select
                        id="entryProject"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="w-full mt-1 p-3 bg-white/5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#00F5FF] appearance-none"
                    >
                        <option value="" disabled>{t('selectProject')}</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="text-sm text-gray-400">{t('startDate')}</label>
                        <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 p-3 bg-white/5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#00F5FF]"/>
                    </div>
                     <div>
                        <label htmlFor="startTime" className="text-sm text-gray-400">{t('startTime')}</label>
                        <input id="startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full mt-1 p-3 bg-white/5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#00F5FF]"/>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="endDate" className="text-sm text-gray-400">{t('endDate')}</label>
                        <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 p-3 bg-white/5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#00F5FF]"/>
                    </div>
                     <div>
                        <label htmlFor="endTime" className="text-sm text-gray-400">{t('endTime')}</label>
                        <input id="endTime" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full mt-1 p-3 bg-white/5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#00F5FF]"/>
                    </div>
                </div>

                <div className="flex gap-4">
                     <button onClick={onClose} className="flex-1 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">{t('cancel')}</button>
                     <FloatingButton onClick={handleSave} ariaLabel={t('save')} className="flex-1 h-12">
                        <span className="font-bold">{t('save')}</span>
                     </FloatingButton>
                </div>
            </GlassCard>
        </div>
    );
};
