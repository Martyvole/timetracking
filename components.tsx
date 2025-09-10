import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { Installation, WorkEntry, TimeEntry, PanelEntry, Screen, User, Task } from './types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Rectangle } from 'recharts';

// --- Icon Components ---

const Icon: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}>
        {children}
    </svg>
);

const MSTLogo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`relative w-32 h-32 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-1)] to-[var(--accent-2)] rounded-3xl blur-xl opacity-50"></div>
        <div className="relative w-full h-full bg-black/20 border border-[var(--border-color)] rounded-3xl flex items-center justify-center backdrop-blur-sm">
            <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24">
                <defs>
                    <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--accent-1)"/>
                        <stop offset="100%" stopColor="var(--accent-2)"/>
                    </linearGradient>
                </defs>
                {/* Solar panel grid on top */}
                <g opacity="0.5">
                    <path d="M 20 20 L 100 20 L 100 28 L 20 28 Z" fill="url(#logoGrad)" />
                    <rect x="20" y="21" width="80" height="6" fill="#000" opacity="0.3" />
                    <line x1="30" y1="20" x2="30" y2="28" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                    <line x1="40" y1="20" x2="40" y2="28" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                    <line x1="50" y1="20" x2="50" y2="28" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                    <line x1="60" y1="20" x2="60" y2="28" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                    <line x1="70" y1="20" x2="70" y2="28" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                    <line x1="80" y1="20" x2="80" y2="28" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                    <line x1="90" y1="20" x2="90" y2="28" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                </g>
                {/* Letters */}
                <text x="5" y="85" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="70" fill="url(#logoGrad)">M</text>
                <text x="50" y="85" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="70" fill="url(#logoGrad)">S</text>
                <text x="85" y="85" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="70" fill="url(#logoGrad)">T</text>
            </svg>
        </div>
    </div>
);


export const TimerIcon: React.FC = () => <Icon><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-1 4v5h5v-2h-3V8H11Z" /></Icon>;
export const StatsIcon: React.FC = () => <Icon><path d="M3 12h2v9H3v-9Zm5-4h2v13H8V8Zm5-5h2v18h-2V3Zm5 9h2v9h-2v-9Z" /></Icon>;
export const InstallationsIcon: React.FC = () => <Icon><path d="M3 4c0-.552.448-1 1-1h16c.552 0 1 .448 1 1v16c0 .552-.448 1-1 1H4c-.552 0-1-.448-1-1V4Zm2 1v14h14V5H5Zm2 2h4v4H7V7Zm6 0h4v4h-4V7Zm-6 6h4v4H7v-4Zm6 0h4v4h-4v-4Z"/></Icon>;
export const SettingsIcon: React.FC = () => <Icon><path d="M12 1a9 9 0 0 0-6.12 15.65.75.75 0 0 1-.22 1.05l-1.59 1.59a.75.75 0 0 0 1.06 1.06l1.59-1.59a.75.75 0 0 1 1.05-.22A9 9 0 1 0 12 1Zm0 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" clipRule="evenodd" fillRule="evenodd"/></Icon>;
export const HistoryIcon: React.FC = () => <Icon><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8Zm1-12h-2v5h5v-2h-3V8Z" clipRule="evenodd" fillRule="evenodd" /></Icon>;
export const PlayIcon: React.FC = () => <Icon><path d="M8 5.14v14l11-7-11-7Z" /></Icon>;
export const PauseIcon: React.FC = () => <Icon><path d="M6 5h4v14H6V5Zm8 0h4v14h-4V5Z" /></Icon>;
export const StopIcon: React.FC = () => <Icon><path d="M6 6h12v12H6V6Z" /></Icon>;
export const PlusIcon: React.FC = () => <Icon><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6Z" /></Icon>;
export const KebabMenuIcon: React.FC = () => <Icon><path d="M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></Icon>;
export const EditIcon: React.FC = () => <Icon><path d="m16.262 3.126 4.612 4.612-11.88 11.88-5.717 1.117 1.117-5.717L16.262 3.126ZM18.429 1.943l-2.167 2.167-4.612-4.612 2.167-2.167a1 1 0 0 1 1.414 0l3.198 3.198a1 1 0 0 1 0 1.414Z"/></Icon>;
export const TrashIcon: React.FC = () => <Icon><path d="M4 6h16v2H4V6Zm2 14v-9h12v9H6Zm2-7h2v5H8v-5Zm4 0h2v5h-2v-5Zm-6-5h10V4H8v2Z"/></Icon>;
export const PanelIcon: React.FC = () => <Icon><path d="M2 2h20v20H2V2zm2 2v3h16V4H4zm0 5v4h7V9H4zm9 0v4h7V9h-7zm-9 6v4h7v-4H4zm9 0v4h7v-4h-7z"/></Icon>;
export const NoteIcon: React.FC<{ className?: string }> = ({ className }) => <Icon className={className}><path d="M4 2.5A1.5 1.5 0 0 0 2.5 4v16A1.5 1.5 0 0 0 4 21.5h16a1.5 1.5 0 0 0 1.5-1.5V4A1.5 1.5 0 0 0 20 2.5H4ZM4 4h16v16H4V4Zm3 3.5h10v2H7v-2Zm0 4h10v2H7v-2Zm0 4h6v2H7v-2Z"/></Icon>;
export const TaskIcon: React.FC<{ className?: string }> = ({ className }) => <Icon className={className}><path d="M3.75 3h16.5c.966 0 1.75.784 1.75 1.75v14.5A1.75 1.75 0 0 1 20.25 21H3.75A1.75 1.75 0 0 1 2 19.25V4.75C2 3.784 2.784 3 3.75 3ZM3.5 4.75v14.5c0 .138.112.25.25.25h16.5a.25.25 0 0 0 .25-.25V4.75a.25.25 0 0 0-.25-.25H3.75a.25.25 0 0 0-.25.25Zm4-1.25a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Zm8 0a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5ZM8 9.75a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 8 9.75Zm.75 3.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"/></Icon>;


// --- UI Components ---

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-[var(--secondary)] border border-[var(--border-color)] rounded-3xl overflow-hidden ${className}`}>
        {children}
    </div>
);

export const FloatingButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string, ariaLabel: string, disabled?: boolean }> = ({ onClick, children, className, ariaLabel, disabled }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`relative group flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <div className={`absolute inset-0 bg-gradient-to-br from-[var(--accent-1)] to-[var(--accent-2)] rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-70 group-hover:opacity-90 ${disabled ? 'opacity-30' : ''}`}></div>
        <div className={`relative w-full h-full bg-gradient-to-br from-[var(--accent-1)] to-[var(--accent-2)] text-[var(--primary)] rounded-full flex items-center justify-center shadow-lg font-bold`}>
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
    const navItems: { screen: Screen, icon: React.ReactNode, labelKey: 'timer' | 'history' | 'stats' | 'installations' | 'settings' }[] = [
        { screen: 'timer', icon: <TimerIcon />, labelKey: 'timer' },
        { screen: 'history', icon: <HistoryIcon />, labelKey: 'history' },
        { screen: 'stats', icon: <StatsIcon />, labelKey: 'stats' },
        { screen: 'installations', icon: <InstallationsIcon />, labelKey: 'installations' },
        { screen: 'settings', icon: <SettingsIcon />, labelKey: 'settings' },
    ];
    const activeIndex = useMemo(() => navItems.findIndex(item => item.screen === activeScreen), [activeScreen]);


    const handleNavClick = (screen: Screen) => {
        setActiveScreen(screen);
        onHapticTrigger();
    };

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm mx-auto mb-3 z-50">
            <Card className="p-2">
                <div className="relative flex justify-around items-center h-16">
                     <div
                        className="absolute top-1/2 -translate-y-1/2 left-0 h-12 w-1/5 bg-white/5 rounded-full transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(${activeIndex * 100}%) translateY(-50%)` }}
                    />
                    {navItems.map(item => (
                        <button
                            key={item.screen}
                            onClick={() => handleNavClick(item.screen)}
                            className={`relative flex flex-col items-center justify-center w-1/5 h-full text-xs transition-colors duration-300 rounded-2xl z-10 ${
                                activeScreen === item.screen ? 'text-[var(--accent-1)]' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <div className={`transition-transform duration-300 ${activeScreen === item.screen ? 'scale-110' : ''}`}>
                                {item.icon}
                            </div>
                            <span className={`mt-1 font-semibold transition-opacity duration-300 ${activeScreen === item.screen ? 'opacity-100' : 'opacity-70'}`}>
                                {t(item.labelKey)}
                            </span>
                        </button>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export const OfflineIndicator: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 w-auto px-4 py-2 bg-red-500/50 backdrop-blur-md border border-red-500/80 rounded-full z-[60] text-white text-sm font-semibold animate-pulse">
        {t('offline')}
    </div>
);


// --- Feature Components ---
const AuroraBackground: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden rounded-full">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-[var(--accent-1)] via-[var(--accent-2)] to-[var(--accent-3)] animate-spin-slow"/>
    </div>
);


interface TimerDisplayProps {
    elapsedTime: number;
    earnings: number;
    activeInstallation?: Installation;
    currency: string;
    isActive: boolean;
    t: (key: string) => string;
    language: 'en' | 'cs';
}
export const TimerDisplay: React.FC<TimerDisplayProps> = ({ elapsedTime, earnings, activeInstallation, currency, isActive, t, language }) => {
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

    return (
        <div className="relative flex flex-col items-center justify-center w-[300px] h-[300px] md:w-[350px] md:h-[350px]">
            <div className={`absolute inset-0 transition-opacity duration-500 ${isActive ? 'opacity-30' : 'opacity-10'}`}>
                <AuroraBackground />
            </div>
            <div className="absolute inset-4 bg-[var(--primary)] rounded-full" />

            <div className="z-10 flex flex-col items-center">
                <p 
                    className="font-timer text-6xl md:text-7xl font-light tracking-tighter text-white"
                >
                    {formatTime(elapsedTime)}
                </p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)]">
                    {formatCurrency(earnings)}
                </p>
                 <p className="mt-2 text-[var(--text-secondary)] text-sm truncate max-w-[200px]">{activeInstallation ? activeInstallation.name : t('noInstallationSelected')}</p>
            </div>
        </div>
    );
};

interface StatsDashboardProps {
    entries: WorkEntry[];
    hourlyWage: number;
    panelRate: number;
    currency: string;
    userName?: string;
    t: (key: string, ...args: any[]) => string;
    language: 'en' | 'cs';
    isAdmin: boolean;
    allUsers: User[];
    adminView: string;
    setAdminView: (view: string) => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ entries, hourlyWage, panelRate, currency, userName, t, language, isAdmin, allUsers, adminView, setAdminView }) => {
    const { totalHours, totalPanels, totalEarnings, chartData } = useMemo(() => {
        const timeEntries = entries.filter(e => e.type === 'hourly') as TimeEntry[];
        const panelEntries = entries.filter(e => e.type === 'panels') as PanelEntry[];

        const totalHours = timeEntries.reduce((acc, e) => acc + e.duration, 0) / 3600;
        const totalPanels = panelEntries.reduce((acc, e) => acc + e.count, 0);

        const hourlyEarnings = totalHours * hourlyWage;
        const panelEarnings = totalPanels * panelRate;
        const totalEarnings = hourlyEarnings + panelEarnings;
        
        const dataByDay: { [key: string]: { name: string, hours: number } } = {};
        const today = new Date();

        for(let i=6; i>=0; i--){
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dayKey = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
            const dayName = d.toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', { weekday: 'short' });
            dataByDay[dayKey] = { name: dayName, hours: 0 };
        }

        timeEntries.forEach(entry => {
            const entryDate = new Date(entry.startTime).toLocaleDateString('en-CA');
            if(dataByDay[entryDate]) {
                dataByDay[entryDate].hours += entry.duration / 3600;
            }
        });
        const chartData = Object.values(dataByDay);

        return { totalHours, totalPanels, totalEarnings, chartData };
    }, [entries, hourlyWage, panelRate, language]);

    const formatCurrency = (amount: number) => {
         return new Intl.NumberFormat(language === 'cs' ? 'cs-CZ' : 'en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(amount);
    }

    const nonAdminUsers = useMemo(() => allUsers.filter(u => !u.isAdmin), [allUsers]);

    return (
        <div className="p-4 space-y-6 text-white fade-in">
            <h2 className="font-display text-4xl font-extrabold text-center">{t('statistics')}</h2>
            {userName && <p className="text-center text-[var(--text-secondary)] -mt-4">{t('forUser', userName)}</p>}
            
            <div className={`grid grid-cols-2 ${isAdmin ? 'grid-rows-4' : 'grid-rows-3'} gap-4 auto-rows-fr h-[calc(100dvh-200px)]`}>
                 {isAdmin && (
                     <div className="col-span-2">
                         <Card className="p-4 h-full">
                             <select 
                                value={adminView}
                                onChange={(e) => setAdminView(e.target.value)}
                                className="custom-input w-full h-full text-center font-bold"
                             >
                                <option value="all">{t('allUsers')}</option>
                                {nonAdminUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                             </select>
                         </Card>
                     </div>
                 )}
                <div className="col-span-2">
                    <Card className="p-4 flex flex-col justify-center items-center h-full text-center bg-gradient-to-br from-[var(--secondary)] to-black/20">
                        <p className="text-[var(--text-secondary)] text-sm">{t('totalEarnings')}</p>
                        <p className="text-5xl font-bold font-timer text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)]">{formatCurrency(totalEarnings)}</p>
                    </Card>
                </div>
                 <div className="col-span-1">
                    <Card className="p-4 flex flex-col justify-center items-center h-full text-center">
                        <p className="text-[var(--text-secondary)] text-sm">{t('totalHours')}</p>
                        <p className="text-4xl font-bold font-timer">{totalHours.toFixed(1)}</p>
                    </Card>
                 </div>
                 <div className="col-span-1">
                     <Card className="p-4 flex flex-col justify-center items-center h-full text-center">
                         <p className="text-[var(--text-secondary)] text-sm">{t('totalPanels')}</p>
                        <p className="text-4xl font-bold font-timer">{totalPanels}</p>
                    </Card>
                 </div>
                <div className="col-span-2">
                    <Card className="p-4 h-full">
                        <h3 className="text-lg font-bold mb-4 ml-2">{t('weeklyHours')}</h3>
                        <ResponsiveContainer width="100%" height="calc(100% - 40px)">
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 20 }}>
                                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--primary)', border: '1px solid var(--border-color)', borderRadius: '16px', color: 'white' }}
                                    cursor={<Rectangle fill="rgba(255,255,255,0.05)" />}
                                />
                                <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill="url(#colorUv)" />)}
                                </Bar>
                                 <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-1)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--accent-2)" stopOpacity={0.8}/>
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const INSTALLATION_COLORS = ['#FFC300', '#FF5733', '#415a77', '#38E4AE', '#9D4EDD', '#00F5FF'];

interface InstallationListProps {
    installations: Installation[];
    onSelectInstallation: (installationId: string) => void;
    activeInstallationId?: string;
    onCreateInstallation: () => void;
    onEditInstallation: (installation: Installation) => void;
    onDeleteInstallation: (installationId: string) => void;
    onManageTasks: (installation: Installation) => void;
    onHapticTrigger: (type: 'light' | 'medium' | 'error') => void;
    t: (key: string) => string;
    isReadOnly?: boolean;
}

export const InstallationList: React.FC<InstallationListProps> = ({ installations, onSelectInstallation, activeInstallationId, onCreateInstallation, onEditInstallation, onDeleteInstallation, onManageTasks, onHapticTrigger, t, isReadOnly = false }) => {
    const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

    const toggleMenu = (installationId: string) => {
        onHapticTrigger('light');
        setMenuOpenFor(prev => (prev === installationId ? null : installationId));
    };
    
    return (
        <div className="p-4 space-y-4 text-white relative h-full flex flex-col fade-in">
            <h2 className="font-display text-4xl font-extrabold text-center">{t('installationsTitle')}</h2>
            <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                {installations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <p className="text-lg">{t('noInstallations')}</p>
                        <p className="text-sm">{t('noInstallationsDesc')}</p>
                    </div>
                ) : installations.map(p => (
                    <div key={p.id} className="relative">
                        <Card className={`w-full transition-all duration-300 flex items-center justify-between ${activeInstallationId === p.id ? 'border-[var(--accent-1)] shadow-[0_0_20px_var(--glow)]' : ''}`}>
                            <button onClick={() => onSelectInstallation(p.id)} className="flex-grow flex items-center gap-4 p-4 text-left">
                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: p.color}}></div>
                                <span className="font-bold">{p.name}</span>
                                {activeInstallationId === p.id && <div className="w-2 h-2 rounded-full bg-[var(--accent-1)] animate-pulse ml-auto"></div>}
                            </button>
                            {!isReadOnly && (
                                <div className="flex">
                                    <button onClick={() => onManageTasks(p)} className="p-4 text-gray-400 hover:text-white" aria-label={t('manageTasks')}>
                                        <TaskIcon />
                                    </button>
                                    <button onClick={() => toggleMenu(p.id)} className="p-4 text-gray-400 hover:text-white" aria-label={t('edit') + ' or ' + t('delete')}>
                                        <KebabMenuIcon />
                                    </button>
                                </div>
                            )}
                        </Card>
                        {menuOpenFor === p.id && (
                             <Card className="absolute right-0 top-full mt-2 w-40 z-20 p-2">
                                 <button onClick={() => { onEditInstallation(p); setMenuOpenFor(null); }} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-white/5">
                                    <EditIcon /> {t('edit')}
                                 </button>
                                 <button onClick={() => { onDeleteInstallation(p.id); setMenuOpenFor(null); }} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-red-500">
                                     <TrashIcon /> {t('delete')}
                                 </button>
                             </Card>
                        )}
                    </div>
                ))}
            </div>
            {!isReadOnly && (
                <FloatingButton onClick={onCreateInstallation} ariaLabel={t('addInstallation')} className="absolute bottom-4 right-4 w-16 h-16">
                    <PlusIcon />
                </FloatingButton>
            )}
        </div>
    );
};

interface InstallationModalProps {
    installation?: Installation | null;
    onClose: () => void;
    onSave: (installationData: { name: string, color: string }) => void;
    t: (key: string) => string;
}

export const InstallationModal: React.FC<InstallationModalProps> = ({ installation, onClose, onSave, t }) => {
    const isEditing = !!installation;
    const [name, setName] = useState(installation?.name || '');
    const [color, setColor] = useState(installation?.color || INSTALLATION_COLORS[0]);

    const handleSave = () => {
        if (name.trim()) {
            onSave({ name, color });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm p-6 space-y-6">
                <h2 className="font-display text-2xl font-bold text-center">{isEditing ? t('editInstallation') : t('newInstallation')}</h2>
                <div>
                    <label htmlFor="installationName" className="text-sm text-[var(--text-secondary)]">{t('installationName')}</label>
                    <input
                        id="installationName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="custom-input mt-1"
                    />
                </div>
                <div>
                    <label className="text-sm text-[var(--text-secondary)]">{t('color')}</label>
                    <div className="flex justify-between mt-2">
                        {INSTALLATION_COLORS.map(c => (
                            <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-[var(--secondary)] ring-white' : ''}`} style={{ backgroundColor: c }}></button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-4">
                     <button onClick={onClose} className="flex-1 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">{t('cancel')}</button>
                     <FloatingButton onClick={handleSave} ariaLabel={t('save')} className="flex-1 h-12">
                        <span>{t('save')}</span>
                     </FloatingButton>
                </div>
            </Card>
        </div>
    );
};

interface SettingsScreenProps {
    hourlyWage: number;
    setHourlyWage: (rate: number) => void;
    panelRate: number;
    setPanelRate: (rate: number) => void;
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

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ hourlyWage, setHourlyWage, panelRate, setPanelRate, currency, setCurrency, onExport, onImport, onReset, currentUser, onSwitchUser, t, language, setLanguage }) => {
    const importRef = useRef<HTMLInputElement>(null);
    const [localHourlyWage, setLocalHourlyWage] = useState(String(hourlyWage));
    const [localPanelRate, setLocalPanelRate] = useState(String(panelRate));

    useEffect(() => {
        setLocalHourlyWage(String(hourlyWage));
    }, [hourlyWage]);
    
    useEffect(() => {
        setLocalPanelRate(String(panelRate));
    }, [panelRate]);

    const handleBlur = (
        localValue: string,
        setter: (val: number) => void,
        localSetter: (val: string) => void,
        fallbackValue: number
    ) => {
        const num = parseFloat(localValue);
        if (localValue.trim() === '') {
            setter(0);
        } else if (!isNaN(num) && num >= 0) {
            setter(num);
        } else {
            localSetter(String(fallbackValue));
        }
    };


    return (
        <div className="p-4 space-y-6 text-white fade-in">
            <h2 className="font-display text-4xl font-extrabold text-center">{t('settingsTitle')}</h2>
            
            {currentUser && (
                <Card className="p-6 space-y-4">
                    <h3 className="font-bold text-lg text-[var(--text-secondary)]">{t('userProfile')}</h3>
                    <div className="flex items-center justify-between">
                        <p>{t('loggedInAs')} <span className="font-bold text-[var(--accent-1)]">{currentUser.name}</span></p>
                        <button onClick={onSwitchUser} className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors font-semibold">{t('switchUser')}</button>
                    </div>
                </Card>
            )}

            <Card className="p-6 space-y-4">
                <h3 className="font-bold text-lg text-[var(--text-secondary)]">{t('rates')}</h3>
                 <div>
                    <label htmlFor="hourlyWage" className="text-sm text-[var(--text-secondary)]">{t('hourlyWage')}</label>
                    <input
                        id="hourlyWage"
                        type="text"
                        inputMode="decimal"
                        value={localHourlyWage}
                        onChange={(e) => setLocalHourlyWage(e.target.value)}
                        onBlur={() => handleBlur(localHourlyWage, setHourlyWage, setLocalHourlyWage, hourlyWage)}
                        className="custom-input mt-1"
                    />
                </div>
                 <div>
                    <label htmlFor="panelRate" className="text-sm text-[var(--text-secondary)]">{t('ratePerPanel')}</label>
                    <input
                        id="panelRate"
                        type="text"
                        inputMode="decimal"
                        value={localPanelRate}
                        onChange={(e) => setLocalPanelRate(e.target.value)}
                        onBlur={() => handleBlur(localPanelRate, setPanelRate, setLocalPanelRate, panelRate)}
                        className="custom-input mt-1"
                    />
                </div>
                 <div>
                    <label htmlFor="currency" className="text-sm text-[var(--text-secondary)]">{t('currencySymbol')}</label>
                    <input
                        id="currency"
                        type="text"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                        className="custom-input mt-1"
                    />
                </div>
            </Card>
            
            <Card className="p-6 space-y-4">
                <h3 className="font-bold text-lg text-[var(--text-secondary)]">{t('language')}</h3>
                <div className="flex gap-4">
                    <button onClick={() => setLanguage('en')} className={`flex-1 p-3 rounded-full font-semibold transition-colors ${language === 'en' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}>English</button>
                    <button onClick={() => setLanguage('cs')} className={`flex-1 p-3 rounded-full font-semibold transition-colors ${language === 'cs' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}>Čeština</button>
                </div>
            </Card>

             <Card className="p-6 space-y-4">
                 <h3 className="font-bold text-lg text-[var(--text-secondary)]">{t('dataManagement')}</h3>
                 <div className="flex gap-4">
                     <button onClick={onExport} className="flex-1 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors font-semibold">{t('exportData')}</button>
                     <button onClick={() => importRef.current?.click()} className="flex-1 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors font-semibold">{t('importData')}</button>
                     <input type="file" ref={importRef} onChange={onImport} accept=".json" className="hidden" />
                 </div>
            </Card>

            <Card className="p-6 space-y-4 border-red-500/50">
                 <h3 className="font-bold text-lg text-red-400">{t('dangerZone')}</h3>
                 <p className="text-sm text-[var(--text-secondary)]">{t('dangerZoneDesc')}</p>
                 <button onClick={onReset} className="w-full p-3 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 transition-colors font-bold">
                    {t('resetAllData')}
                </button>
            </Card>
        </div>
    );
};

interface UserSelectionScreenProps {
    users: User[];
    onSelectUser: (userId: string) => void;
    onCreateUser: (name: string) => void;
    onAdminLoginRequest: () => void;
    t: (key: string) => string;
}

export const UserSelectionScreen: React.FC<UserSelectionScreenProps> = ({ users, onSelectUser, onCreateUser, onAdminLoginRequest, t }) => {
    const [newUserName, setNewUserName] = useState('');
    const [tapCount, setTapCount] = useState(0);
    const tapTimeout = useRef<number | null>(null);
    const parallaxRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const parallaxContainer = parallaxRef.current;
        if (!parallaxContainer) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const moveX = (clientX - innerWidth / 2) / (innerWidth / 2) * -10; // -10 to 10px range
            const moveY = (clientY - innerHeight / 2) / (innerHeight / 2) * -10;
            parallaxContainer.style.transform = `translateX(${moveX}px) translateY(${moveY}px) perspective(1000px)`;
        };
        
        const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
            const { gamma, beta } = e; // gamma: left-to-right tilt, beta: front-to-back tilt
            if (gamma === null || beta === null) return;
            const moveX = (gamma / 45) * -15; // Max 15px move
            const moveY = (beta / 90) * -15;
            parallaxContainer.style.transform = `translateX(${moveX}px) translateY(${moveY}px) perspective(1000px)`;
        };

        window.addEventListener('mousemove', handleMouseMove);
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('deviceorientation', handleDeviceOrientation);
        };
    }, []);


    const handleCreate = () => {
        if (newUserName.trim()) {
            onCreateUser(newUserName.trim());
            setNewUserName('');
        }
    };
    
    const handleIconTap = () => {
        if (tapTimeout.current) {
            clearTimeout(tapTimeout.current);
        }

        const newTapCount = tapCount + 1;
        setTapCount(newTapCount);

        if (newTapCount >= 5) {
            onAdminLoginRequest();
            setTapCount(0);
        } else {
            tapTimeout.current = window.setTimeout(() => {
                setTapCount(0);
            }, 500);
        }
    }

    return (
        <div className="w-full h-full animated-gradient-bg flex flex-col items-center justify-center p-8 text-white overflow-hidden">
            <div ref={parallaxRef} style={{ transition: 'transform 0.1s linear' }}>
                <div onClick={handleIconTap} className="cursor-pointer mb-8 animate-logo-float">
                    <MSTLogo/>
                </div>
            </div>

            <Card className="w-full max-w-sm p-6 space-y-4 bg-black/20 backdrop-blur-sm border border-white/10">
                <h3 className="text-xl font-bold text-center">{t('selectOrCreateProfile')}</h3>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                    {users.filter(u => !u.isAdmin).map(user => (
                        <button key={user.id} onClick={() => onSelectUser(user.id)} className="w-full p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors font-semibold">
                            {user.name}
                        </button>
                    ))}
                </div>

                <div className="pt-4 border-t border-[var(--border-color)]">
                    <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder={t('enterNewUserName')}
                        className="custom-input"
                    />
                    <FloatingButton onClick={handleCreate} ariaLabel={t('createUser')} className="w-full h-12 mt-4">
                        <span>{t('createUser')}</span>
                    </FloatingButton>
                </div>
            </Card>
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

const groupEntriesByDate = (entries: WorkEntry[]) => {
    return entries
        .sort((a, b) => (b.type === 'hourly' ? b.startTime : b.date) - (a.type === 'hourly' ? a.startTime : a.date))
        .reduce((acc, entry) => {
            const entryDate = new Date(entry.type === 'hourly' ? entry.startTime : entry.date);
            const key = entryDate.toDateString();
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(entry);
            return acc;
        }, {} as Record<string, WorkEntry[]>);
};

interface WorkLogScreenProps {
    entries: WorkEntry[];
    installations: Installation[];
    onAdd: () => void;
    onViewDetails: (entry: WorkEntry) => void;
    onHapticTrigger: (type: 'light' | 'medium' | 'error') => void;
    t: (key: string, ...args: any[]) => string;
    language: 'en' | 'cs';
    isReadOnly?: boolean;
}

export const WorkLogScreen: React.FC<WorkLogScreenProps> = ({ entries, installations, onAdd, onViewDetails, onHapticTrigger, t, language, isReadOnly = false }) => {
    const installationMap = useMemo(() => new Map(installations.map(p => [p.id, p])), [installations]);
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
        <div className="p-4 space-y-4 text-white relative h-full flex flex-col fade-in">
            <h2 className="font-display text-4xl font-extrabold text-center px-2">{t('historyTitle')}</h2>
            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                {entries.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <p className="text-lg">{t('noWorkLogs')}</p>
                        <p className="text-sm">{t('noWorkLogsDesc')}</p>
                    </div>
                ) : (
                    Object.entries(groupedEntries).map(([dateKey, entriesOnDate]) => (
                        <div key={dateKey}>
                            <h3 className="font-bold text-[var(--text-secondary)] mb-2 px-4">{formatDateHeader(dateKey)}</h3>
                            <div className="space-y-3">
                                {entriesOnDate.map(entry => {
                                    const installation = installationMap.get(entry.installationId);
                                    const isTimeEntry = entry.type === 'hourly';
                                    return (
                                        <button key={entry.id} className="w-full text-left" onClick={() => { onHapticTrigger('light'); onViewDetails(entry); }}>
                                            <Card className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                                <div className="w-2 h-10 rounded-full" style={{ backgroundColor: installation?.color || '#888' }}></div>
                                                <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                                                    {isTimeEntry ? <TimerIcon /> : <PanelIcon />}
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="font-bold">{installation?.name || t('unknownInstallation')}</p>
                                                    {isTimeEntry && (
                                                        <p className="text-sm text-[var(--text-secondary)]">
                                                            {formatTime(entry.startTime, language)} - {entry.endTime ? formatTime(entry.endTime, language) : '...'}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right flex items-center gap-2">
                                                    {entry.taskId && <TaskIcon className="w-4 h-4 text-[var(--text-secondary)]" />}
                                                    {entry.notes && entry.notes.replace(/<[^>]*>?/gm, '').trim() !== '' && <NoteIcon className="w-4 h-4 text-[var(--text-secondary)]"/>}
                                                    <p className="font-bold font-timer text-lg">
                                                        {isTimeEntry ? formatDuration(entry.duration) : `${entry.count} ${t('panels')}`}
                                                    </p>
                                                </div>
                                            </Card>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
            {!isReadOnly && (
                 <FloatingButton onClick={onAdd} ariaLabel={t('addLog')} className="absolute bottom-4 right-4 w-16 h-16">
                    <PlusIcon />
                 </FloatingButton>
            )}
        </div>
    );
};

interface TimeEntryModalProps {
    entry?: TimeEntry | null;
    installations: Installation[];
    tasks: Task[];
    onClose: () => void;
    onSave: (entryData: { installationId: string; startTime: number; endTime: number, taskId?: string, notes?: string }) => void;
    t: (key: string) => string;
}

const toISODate = (timestamp: number) => new Date(timestamp).toISOString().split('T')[0];
const toISOTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export const TimeEntryModal: React.FC<TimeEntryModalProps> = ({ entry, installations, tasks, onClose, onSave, t }) => {
    const isEditing = !!entry;
    const now = Date.now();
    
    const [installationId, setInstallationId] = useState(entry?.installationId || installations[0]?.id || '');
    const [startDate, setStartDate] = useState(toISODate(entry?.startTime || now));
    const [startTime, setStartTime] = useState(toISOTime(entry?.startTime || now));
    const [endDate, setEndDate] = useState(toISODate(entry?.endTime || now));
    const [endTime, setEndTime] = useState(toISOTime(entry?.endTime || now));
    const [taskId, setTaskId] = useState(entry?.taskId || '');
    const [notes, setNotes] = useState(entry?.notes || '');
    const notesEditorRef = useRef<HTMLDivElement>(null);

    const availableTasks = useMemo(() => tasks.filter(t => t.installationId === installationId), [tasks, installationId]);
    
    useEffect(() => {
        // Reset task if installation changes and task is no longer valid
        if (!availableTasks.find(t => t.id === taskId)) {
            setTaskId('');
        }
    }, [installationId, availableTasks, taskId]);

    useEffect(() => {
        if (notesEditorRef.current) {
            notesEditorRef.current.innerHTML = entry?.notes || '';
        }
    }, [entry]);
    
    const handleSave = () => {
        if (!installationId) {
            alert(t('selectInstallation'));
            return;
        }

        const startTimestamp = new Date(`${startDate}T${startTime}`).getTime();
        const endTimestamp = new Date(`${endDate}T${endTime}`).getTime();

        if (startTimestamp >= endTimestamp) {
            alert(t('endTimeAfterStart'));
            return;
        }
        
        onSave({ installationId, startTime: startTimestamp, endTime: endTimestamp, taskId: taskId || undefined, notes });
    };

    const handleNotesInput = (e: React.FormEvent<HTMLDivElement>) => {
        setNotes(e.currentTarget.innerHTML);
    };

    const execCmd = (cmd: string) => {
        document.execCommand(cmd, false);
        notesEditorRef.current?.focus();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm p-6 space-y-4 text-white overflow-y-auto max-h-[90vh]">
                <h2 className="font-display text-2xl font-bold text-center">{isEditing ? t('editTimeEntry') : t('newTimeEntry')}</h2>
                
                <div>
                    <label htmlFor="entryInstallation" className="text-sm text-[var(--text-secondary)]">{t('installation')}</label>
                    <select
                        id="entryInstallation"
                        value={installationId}
                        onChange={(e) => setInstallationId(e.target.value)}
                        className="custom-input mt-1"
                    >
                        <option value="" disabled>{t('selectInstallation')}</option>
                        {installations.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="text-sm text-[var(--text-secondary)]">{t('startDate')}</label>
                        <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="custom-input mt-1"/>
                    </div>
                     <div>
                        <label htmlFor="startTime" className="text-sm text-[var(--text-secondary)]">{t('startTime')}</label>
                        <input id="startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="custom-input mt-1"/>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="endDate" className="text-sm text-[var(--text-secondary)]">{t('endDate')}</label>
                        <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="custom-input mt-1"/>
                    </div>
                     <div>
                        <label htmlFor="endTime" className="text-sm text-[var(--text-secondary)]">{t('endTime')}</label>
                        <input id="endTime" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="custom-input mt-1"/>
                    </div>
                </div>

                <div>
                    <label htmlFor="entryTask" className="text-sm text-[var(--text-secondary)]">{t('task')} ({t('optional')})</label>
                    <select
                        id="entryTask"
                        value={taskId}
                        onChange={(e) => setTaskId(e.target.value)}
                        className="custom-input mt-1"
                        disabled={!installationId || availableTasks.length === 0}
                    >
                        <option value="">{t('noTaskAssigned')}</option>
                        {availableTasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}
                    </select>
                </div>
                
                <div>
                    <label className="text-sm text-[var(--text-secondary)]">{t('notes')}</label>
                    <div className="mt-1 border border-[var(--border-color)] rounded-xl">
                        <div className="flex gap-1 p-2 bg-white/5 rounded-t-xl border-b border-[var(--border-color)]">
                            <button type="button" onClick={() => execCmd('bold')} className="font-bold w-8 h-8 rounded hover:bg-white/20">B</button>
                            <button type="button" onClick={() => execCmd('italic')} className="italic w-8 h-8 rounded hover:bg-white/20">I</button>
                            <button type="button" onClick={() => execCmd('underline')} className="underline w-8 h-8 rounded hover:bg-white/20">U</button>
                        </div>
                        <div
                            ref={notesEditorRef}
                            contentEditable
                            onInput={handleNotesInput}
                            className="w-full min-h-[100px] p-3 focus:outline-none"
                            aria-label={t('notes')}
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                     <button onClick={onClose} className="flex-1 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">{t('cancel')}</button>
                     <FloatingButton onClick={handleSave} ariaLabel={t('save')} className="flex-1 h-12">
                        <span>{t('save')}</span>
                     </FloatingButton>
                </div>
            </Card>
        </div>
    );
};

interface PanelLogModalProps {
    entry?: PanelEntry | null;
    installations: Installation[];
    tasks: Task[];
    onClose: () => void;
    onSave: (entryData: { installationId: string; date: number; count: number; taskId?: string, notes?: string; }) => void;
    t: (key: string) => string;
}

export const PanelLogModal: React.FC<PanelLogModalProps> = ({ entry, installations, tasks, onClose, onSave, t }) => {
    const isEditing = !!entry;
    const now = Date.now();

    const [installationId, setInstallationId] = useState(entry?.installationId || installations[0]?.id || '');
    const [date, setDate] = useState(toISODate(entry?.date || now));
    const [countStr, setCountStr] = useState(String(entry?.count || ''));
    const [taskId, setTaskId] = useState(entry?.taskId || '');
    const [notes, setNotes] = useState(entry?.notes || '');
    const notesEditorRef = useRef<HTMLDivElement>(null);

    const availableTasks = useMemo(() => tasks.filter(t => t.installationId === installationId), [tasks, installationId]);
    
    useEffect(() => {
        // Reset task if installation changes and task is no longer valid
        if (!availableTasks.find(t => t.id === taskId)) {
            setTaskId('');
        }
    }, [installationId, availableTasks, taskId]);

    useEffect(() => {
        if (notesEditorRef.current) {
            notesEditorRef.current.innerHTML = entry?.notes || '';
        }
    }, [entry]);

    const handleSave = () => {
        if (!installationId) {
            alert(t('selectInstallation'));
            return;
        }
        const count = parseInt(countStr, 10);
        if (isNaN(count) || count <= 0) {
            alert(t('invalidPanelCount'));
            return;
        }
        
        const dateTimestamp = new Date(date).getTime();
        onSave({ installationId, date: dateTimestamp, count, taskId: taskId || undefined, notes });
    };

    const handleNotesInput = (e: React.FormEvent<HTMLDivElement>) => {
        setNotes(e.currentTarget.innerHTML);
    };

    const execCmd = (cmd: string) => {
        document.execCommand(cmd, false);
        notesEditorRef.current?.focus();
    };


    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm p-6 space-y-4 text-white overflow-y-auto max-h-[90vh]">
                <h2 className="font-display text-2xl font-bold text-center">{isEditing ? t('editPanelLog') : t('newPanelLog')}</h2>
                
                <div>
                    <label htmlFor="panelLogInstallation" className="text-sm text-[var(--text-secondary)]">{t('installation')}</label>
                    <select
                        id="panelLogInstallation"
                        value={installationId}
                        onChange={(e) => setInstallationId(e.target.value)}
                        className="custom-input mt-1"
                    >
                        <option value="" disabled>{t('selectInstallation')}</option>
                        {installations.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="panelLogDate" className="text-sm text-[var(--text-secondary)]">{t('date')}</label>
                    <input id="panelLogDate" type="date" value={date} onChange={e => setDate(e.target.value)} className="custom-input mt-1"/>
                </div>
                <div>
                    <label htmlFor="panelCount" className="text-sm text-[var(--text-secondary)]">{t('panelsInstalled')}</label>
                    <input
                        id="panelCount"
                        type="text"
                        inputMode="numeric"
                        value={countStr}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) {
                                setCountStr(val);
                            }
                        }}
                        className="custom-input mt-1"
                    />
                </div>

                <div>
                    <label htmlFor="panelLogTask" className="text-sm text-[var(--text-secondary)]">{t('task')} ({t('optional')})</label>
                    <select
                        id="panelLogTask"
                        value={taskId}
                        onChange={(e) => setTaskId(e.target.value)}
                        className="custom-input mt-1"
                        disabled={!installationId || availableTasks.length === 0}
                    >
                        <option value="">{t('noTaskAssigned')}</option>
                        {availableTasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}
                    </select>
                </div>

                 <div>
                    <label className="text-sm text-[var(--text-secondary)]">{t('notes')}</label>
                    <div className="mt-1 border border-[var(--border-color)] rounded-xl">
                        <div className="flex gap-1 p-2 bg-white/5 rounded-t-xl border-b border-[var(--border-color)]">
                            <button type="button" onClick={() => execCmd('bold')} className="font-bold w-8 h-8 rounded hover:bg-white/20">B</button>
                            <button type="button" onClick={() => execCmd('italic')} className="italic w-8 h-8 rounded hover:bg-white/20">I</button>
                            <button type="button" onClick={() => execCmd('underline')} className="underline w-8 h-8 rounded hover:bg-white/20">U</button>
                        </div>
                        <div
                            ref={notesEditorRef}
                            contentEditable
                            onInput={handleNotesInput}
                            className="w-full min-h-[100px] p-3 focus:outline-none"
                            aria-label={t('notes')}
                        />
                    </div>
                </div>
                <div className="flex gap-4">
                     <button onClick={onClose} className="flex-1 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">{t('cancel')}</button>
                     <FloatingButton onClick={handleSave} ariaLabel={t('save')} className="flex-1 h-12">
                        <span>{t('save')}</span>
                     </FloatingButton>
                </div>
            </Card>
        </div>
    );
};

interface AddEntryChoiceModalProps {
    onClose: () => void;
    onSelect: (type: 'time' | 'panel') => void;
    t: (key: string) => string;
}

export const AddEntryChoiceModal: React.FC<AddEntryChoiceModalProps> = ({ onClose, onSelect, t }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm p-6 space-y-6 text-white">
                 <h2 className="font-display text-2xl font-bold text-center">{t('addEntryChoiceTitle')}</h2>
                 <div className="flex flex-col gap-4">
                    <button onClick={() => onSelect('time')} className="w-full p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors font-semibold flex items-center justify-center gap-3"><TimerIcon/> {t('addTimeEntry')}</button>
                    <button onClick={() => onSelect('panel')} className="w-full p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors font-semibold flex items-center justify-center gap-3"><PanelIcon/> {t('addPanelLog')}</button>
                 </div>
                 <button onClick={onClose} className="w-full p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">{t('cancel')}</button>
            </Card>
        </div>
    )
};

interface AdminLoginModalProps {
    onClose: () => void;
    onLogin: (password: string) => void;
    t: (key: string) => string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onLogin, t }) => {
    const [password, setPassword] = useState('');
    
    const handleLogin = () => {
        onLogin(password);
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm p-6 space-y-6 text-white">
                 <h2 className="font-display text-2xl font-bold text-center">{t('adminLogin')}</h2>
                 <div>
                    <label htmlFor="adminPassword" className="text-sm text-[var(--text-secondary)]">{t('password')}</label>
                    <input
                        id="adminPassword"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        className="custom-input mt-1"
                    />
                </div>
                 <div className="flex gap-4">
                     <button onClick={onClose} className="flex-1 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">{t('cancel')}</button>
                     <FloatingButton onClick={handleLogin} ariaLabel={t('login')} className="flex-1 h-12">
                        <span>{t('login')}</span>
                     </FloatingButton>
                </div>
            </Card>
        </div>
    )
}

interface WorkEntryDetailModalProps {
    entry: WorkEntry;
    installation?: Installation;
    tasks: Task[];
    onClose: () => void;
    onEdit: (entry: WorkEntry) => void;
    onDelete: (entryId: string) => void;
    t: (key: string, ...args: any[]) => string;
    language: 'en' | 'cs';
    isReadOnly?: boolean;
}

export const WorkEntryDetailModal: React.FC<WorkEntryDetailModalProps> = ({ entry, installation, tasks, onClose, onEdit, onDelete, t, language, isReadOnly }) => {
    const isTimeEntry = entry.type === 'hourly';
    const task = entry.taskId ? tasks.find(t => t.id === entry.taskId) : null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm p-6 space-y-4 text-white">
                <h2 className="font-display text-2xl font-bold text-center">{t('workEntryDetails')}</h2>

                <div className="space-y-2 text-sm">
                    <p><span className="font-semibold text-[var(--text-secondary)]">{t('installation')}:</span> {installation?.name || t('unknownInstallation')}</p>
                    <p><span className="font-semibold text-[var(--text-secondary)]">{t('task')}:</span> {task?.name || t('noTaskAssigned')}</p>
                    {isTimeEntry ? (
                       <>
                         <p><span className="font-semibold text-[var(--text-secondary)]">{t('duration')}:</span> {formatDuration(entry.duration)}</p>
                         <p><span className="font-semibold text-[var(--text-secondary)]">{t('period')}:</span> {formatTime(entry.startTime, language)} - {entry.endTime ? formatTime(entry.endTime, language) : '...'}</p>
                       </>
                    ) : (
                         <p><span className="font-semibold text-[var(--text-secondary)]">{t('panelsInstalled')}:</span> {entry.count}</p>
                    )}
                     <p><span className="font-semibold text-[var(--text-secondary)]">{t('date')}:</span> {new Date(isTimeEntry ? entry.startTime : entry.date).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-lg text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-2 mb-2">{t('notes')}</h3>
                    {entry.notes ? (
                        <div className="text-sm text-gray-300 max-h-40 overflow-y-auto" dangerouslySetInnerHTML={{ __html: entry.notes }} />
                    ) : (
                        <p className="text-gray-500 italic text-sm">{t('noNotes')}</p>
                    )}
                </div>

                <div className="flex gap-4 pt-4">
                    <button onClick={onClose} className="flex-1 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors font-semibold">{t('cancel')}</button>
                    {!isReadOnly && (
                        <div className="flex-1 flex gap-2">
                            <button onClick={() => onEdit(entry)} className="flex-1 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors font-semibold">{t('edit')}</button>
                            <button onClick={() => onDelete(entry.id)} className="flex-1 p-3 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 transition-colors font-semibold">{t('delete')}</button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

interface TaskManagementModalProps {
    installation: Installation;
    tasks: Task[];
    onClose: () => void;
    onAddTask: (name: string) => void;
    onDeleteTask: (taskId: string) => void;
    t: (key: string) => string;
}

export const TaskManagementModal: React.FC<TaskManagementModalProps> = ({ installation, tasks, onClose, onAddTask, onDeleteTask, t }) => {
    const [newTaskName, setNewTaskName] = useState('');

    const handleAddTask = () => {
        if (newTaskName.trim()) {
            onAddTask(newTaskName.trim());
            setNewTaskName('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm p-6 space-y-6 text-white">
                <h2 className="font-display text-2xl font-bold text-center truncate">{t('tasks')}</h2>
                <p className="text-center text-[var(--text-secondary)] -mt-4 truncate">{installation.name}</p>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tasks.length === 0 ? (
                         <p className="text-center text-gray-500 py-4">{t('noTasksForInstallation')}</p>
                    ) : tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                            <span>{task.name}</span>
                            <button onClick={() => onDeleteTask(task.id)} className="text-red-500 hover:text-red-400">
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        placeholder={t('newTaskName')}
                        className="custom-input flex-grow"
                        onKeyPress={e => e.key === 'Enter' && handleAddTask()}
                    />
                    <FloatingButton onClick={handleAddTask} ariaLabel={t('addTask')} className="w-12 h-12">
                        <PlusIcon />
                    </FloatingButton>
                </div>

                <button onClick={onClose} className="w-full p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">{t('cancel')}</button>
            </Card>
        </div>
    );
};