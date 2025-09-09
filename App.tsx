
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Screen, Project, TimeEntry, User } from './types';
import { useLocalStorage, useHapticFeedback, useTranslation } from './hooks';
import { AppIcon, BottomNav, TimerDisplay, StatsDashboard, ProjectList, FloatingButton, PlayIcon, StopIcon, ProjectModal, OfflineIndicator, SettingsScreen, PauseIcon, UserSelectionScreen, TimeEntryListScreen, TimeEntryModal } from './components';

interface PersistentTimerState {
  startTime: number | null;
  accumulatedSeconds: number;
  isPaused: boolean;
  projectId: string | null;
}

// --- Main App Component ---
export default function App() {
    // Custom Hooks
    const triggerHaptic = useHapticFeedback();
    const { t, language, setLanguage } = useTranslation();

    // Global App State
    const [screen, setScreen] = useState<Screen>('timer');
    const [isLoaded, setIsLoaded] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    
    // User Management
    const [users, setUsers] = useLocalStorage<User[]>('flowtime_users', []);
    const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>('flowtime_currentUserId', null);

    // Settings (Global for now)
    const [hourlyRate, setHourlyRate] = useLocalStorage<number>('flowtime_hourlyRate', 200);
    const [currency, setCurrency] = useLocalStorage<string>('flowtime_currency', 'CZK');
    
    // All data stored in localStorage
    const [allProjects, setAllProjects] = useLocalStorage<Project[]>('flowtime_projects', []);
    const [allTimeEntries, setAllTimeEntries] = useLocalStorage<TimeEntry[]>('flowtime_timeEntries', []);
    
    // UI State
    const [activeProjectId, setActiveProjectId] = useLocalStorage<string | undefined>('flowtime_activeProject', undefined);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isTimeEntryModalOpen, setIsTimeEntryModalOpen] = useState(false);
    const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | null>(null);
    const [displayTime, setDisplayTime] = useState(0);
    const [currentEarnings, setCurrentEarnings] = useState(0);
    const [adminStatsView, setAdminStatsView] = useState('all'); // 'all' or a user ID

    // Persistent Timer State
    const [persistentTimer, setPersistentTimer] = useLocalStorage<PersistentTimerState>('flowtime_persistentTimer', {
      startTime: null,
      accumulatedSeconds: 0,
      isPaused: false,
      projectId: null,
    });

    // --- Derived State (User-Scoped Data) ---
    const currentUser = useMemo(() => users.find(u => u.id === currentUserId), [users, currentUserId]);
    const projects = useMemo(() => allProjects.filter(p => p.userId === currentUserId), [allProjects, currentUserId]);
    const timeEntries = useMemo(() => allTimeEntries.filter(e => e.userId === currentUserId), [allTimeEntries, currentUserId]);

    // The main timer effect
    useEffect(() => {
        let interval: number | null = null;
        
        if (persistentTimer.startTime && !persistentTimer.isPaused) {
            interval = window.setInterval(() => {
                const elapsedSinceStart = (Date.now() - (persistentTimer.startTime || 0)) / 1000;
                const totalElapsed = persistentTimer.accumulatedSeconds + elapsedSinceStart;
                setDisplayTime(totalElapsed);
                setCurrentEarnings((totalElapsed / 3600) * hourlyRate);
            }, 1000);
        } else {
            const totalElapsed = persistentTimer.accumulatedSeconds;
            setDisplayTime(totalElapsed);
            setCurrentEarnings((totalElapsed / 3600) * hourlyRate);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [persistentTimer, hourlyRate]);

    useEffect(() => {
        const loadingTimeout = setTimeout(() => setIsLoaded(true), 1500);
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearTimeout(loadingTimeout);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Data validation effect
    useEffect(() => {
        if (activeProjectId && projects.length > 0 && !projects.find(p => p.id === activeProjectId)) {
            setActiveProjectId(undefined);
        }
        if (persistentTimer.projectId && projects.length > 0 && !projects.find(p => p.id === persistentTimer.projectId)) {
            handleStopTimer();
        }
    }, [currentUserId, projects]);


    const projectForTimer = useMemo(() => projects.find(p => p.id === persistentTimer.projectId), [projects, persistentTimer.projectId]);
    const selectedProject = useMemo(() => projects.find(p => p.id === activeProjectId), [projects, activeProjectId]);

    // --- User Management Handlers ---
    const handleSelectUser = (userId: string) => {
        triggerHaptic('success');
        setCurrentUserId(userId);
    };
    const handleCreateUser = (name: string) => {
        triggerHaptic('success');
        const newUser: User = { 
            id: `user-${Date.now()}`, 
            name,
            isAdmin: users.length === 0 // First user is admin
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUserId(newUser.id);
    };
    const handleSwitchUser = () => {
        triggerHaptic('light');
        setCurrentUserId(null);
    };
    
    // --- Timer Handlers ---
    const handleStartTimer = useCallback((startTimeOverride?: number) => {
        if (!activeProjectId) {
            alert(t('selectProjectFirst'));
            return;
        }
        triggerHaptic('medium');
        setPersistentTimer({ 
            startTime: startTimeOverride || Date.now(), 
            accumulatedSeconds: startTimeOverride ? (Date.now() - startTimeOverride) / 1000 : 0, 
            isPaused: false, 
            projectId: activeProjectId 
        });
    }, [activeProjectId, setPersistentTimer, triggerHaptic, t]);

    const handlePauseTimer = useCallback(() => {
        if (persistentTimer.startTime) {
            const elapsed = (Date.now() - persistentTimer.startTime) / 1000;
            setPersistentTimer(prev => ({ ...prev, startTime: null, isPaused: true, accumulatedSeconds: prev.accumulatedSeconds + elapsed }));
            triggerHaptic('light');
        }
    }, [persistentTimer.startTime, setPersistentTimer, triggerHaptic]);

    const handleResumeTimer = useCallback(() => {
        setPersistentTimer(prev => ({ ...prev, startTime: Date.now(), isPaused: false }));
        triggerHaptic('light');
    }, [setPersistentTimer, triggerHaptic]);

    const handleStopTimer = useCallback(() => {
        triggerHaptic('success');

        let finalDuration = persistentTimer.accumulatedSeconds;
        let finalStartTime = Date.now() - (finalDuration * 1000);

        if (!persistentTimer.isPaused && persistentTimer.startTime) {
            const elapsedSinceStart = (Date.now() - persistentTimer.startTime) / 1000;
            finalDuration += elapsedSinceStart;
            finalStartTime = persistentTimer.startTime - (persistentTimer.accumulatedSeconds * 1000);
        }

        if (persistentTimer.projectId && finalDuration > 1 && currentUserId) {
            const newEntry: TimeEntry = {
                id: `entry-${Date.now()}`,
                projectId: persistentTimer.projectId,
                startTime: finalStartTime,
                endTime: Date.now(),
                duration: Math.round(finalDuration),
                userId: currentUserId,
            };
            setAllTimeEntries(prev => [...prev, newEntry]);
        }
        
        setPersistentTimer({ startTime: null, accumulatedSeconds: 0, isPaused: false, projectId: null });
    }, [persistentTimer, setPersistentTimer, setAllTimeEntries, triggerHaptic, currentUserId]);

    // --- Project Handlers ---
    const handleSelectProject = (projectId: string) => {
        triggerHaptic('light');
        setActiveProjectId(projectId);
        setScreen('timer');
    }
    
    const handleOpenProjectModal = (project: Project | null) => {
        triggerHaptic('light');
        setEditingProject(project);
        setIsProjectModalOpen(true);
    };

    const handleCloseProjectModal = () => {
        setIsProjectModalOpen(false);
        setEditingProject(null);
    };

    const handleSaveProject = (projectData: { name: string, color: string }) => {
        if (editingProject) { 
            setAllProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...projectData } : p));
        } else if (currentUserId) { 
            const newProject: Project = { id: `proj-${Date.now()}`, ...projectData, userId: currentUserId };
            setAllProjects(prev => [...prev, newProject]);
        }
        triggerHaptic('success');
        handleCloseProjectModal();
    };

    const handleDeleteProject = (projectId: string) => {
        const entriesForProject = allTimeEntries.filter(e => e.projectId === projectId);
        let confirmationMessage = t('deleteProjectConfirm');
        if (entriesForProject.length > 0) {
            confirmationMessage = t('deleteProjectWithEntriesConfirm', entriesForProject.length);
        }

        if (window.confirm(confirmationMessage)) {
            setAllProjects(prev => prev.filter(p => p.id !== projectId));
            if (entriesForProject.length > 0) {
                setAllTimeEntries(prev => prev.filter(e => e.projectId !== projectId));
            }
            if (activeProjectId === projectId) setActiveProjectId(undefined);
            if (persistentTimer.projectId === projectId) handleStopTimer();
            triggerHaptic('error');
        }
    };

    // --- History / Time Entry Handlers ---
    const handleOpenTimeEntryModal = (entry: TimeEntry | null) => {
        triggerHaptic('light');
        setEditingTimeEntry(entry);
        setIsTimeEntryModalOpen(true);
    };

    const handleCloseTimeEntryModal = () => {
        setIsTimeEntryModalOpen(false);
        setEditingTimeEntry(null);
    };

    const handleSaveTimeEntry = (entryData: { projectId: string; startTime: number; endTime: number; }) => {
        if (!currentUserId) return;
        
        const duration = (entryData.endTime - entryData.startTime) / 1000;
        if (duration <= 0) return;

        if (editingTimeEntry) { 
            const updatedEntry: TimeEntry = { ...editingTimeEntry, ...entryData, duration };
            setAllTimeEntries(prev => prev.map(e => e.id === editingTimeEntry.id ? updatedEntry : e));
        } else { 
            const newEntry: TimeEntry = { 
                id: `entry-${Date.now()}`,
                ...entryData,
                duration,
                userId: currentUserId,
            };
            setAllTimeEntries(prev => [...prev, newEntry]);
        }
        triggerHaptic('success');
        handleCloseTimeEntryModal();
    };

    const handleDeleteTimeEntry = (entryId: string) => {
        if (window.confirm(t('deleteEntryConfirm'))) {
            setAllTimeEntries(prev => prev.filter(e => e.id !== entryId));
            triggerHaptic('error');
        }
    };


    // --- Settings Handlers ---
    const handleExportData = () => {
        try {
            const dataToExport = {
                user: currentUser,
                projects: projects,
                timeEntries: timeEntries,
                settings: { hourlyRate, currency }
            };
            const dataStr = JSON.stringify(dataToExport, null, 2);
            const dataBlob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `flowtime-pro-backup-${currentUser?.name}-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
            triggerHaptic('success');
        } catch (error) {
            alert(t('exportError'));
            triggerHaptic('error');
        }
    };
    
    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentUserId) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text);

                if (window.confirm(t('importConfirm'))) {
                    const importedProjects: Project[] = (data.projects || []).map((p: any) => ({ ...p, id: `proj-${Date.now()}-${Math.random()}`, userId: currentUserId }));
                    const importedEntries: TimeEntry[] = (data.timeEntries || []).map((t: any) => ({ ...t, id: `entry-${Date.now()}-${Math.random()}`, userId: currentUserId }));
                    
                    setAllProjects(prev => [...prev, ...importedProjects]);
                    setAllTimeEntries(prev => [...prev, ...importedEntries]);

                    if (data.settings?.hourlyRate) setHourlyRate(data.settings.hourlyRate);
                    if (data.settings?.currency) setCurrency(data.settings.currency);
                    
                    triggerHaptic('success');
                    alert(t('importSuccess'));
                    setScreen('projects');
                }
            } catch (error) {
                 alert(t('importError'));
                 triggerHaptic('error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleResetData = () => {
        if (window.confirm(t('resetConfirm', currentUser?.name || ''))) {
             setAllProjects(prev => prev.filter(p => p.userId !== currentUserId));
             setAllTimeEntries(prev => prev.filter(t => t.userId !== currentUserId));
             handleStopTimer();
             setActiveProjectId(undefined);
             triggerHaptic('error');
             alert(t('resetSuccess', currentUser?.name || ''));
        }
    };

    const isSessionActive = persistentTimer.projectId !== null;

    // --- Stats Data Preparation ---
    const statsData = useMemo(() => {
        if (currentUser?.isAdmin) {
            if (adminStatsView === 'all') {
                return {
                    entries: allTimeEntries,
                    projects: allProjects,
                    userName: t('allUsers'),
                };
            }
            const selectedUser = users.find(u => u.id === adminStatsView);
            return {
                entries: allTimeEntries.filter(e => e.userId === adminStatsView),
                projects: allProjects.filter(p => p.userId === adminStatsView),
                userName: selectedUser?.name,
            };
        }
        return {
            entries: timeEntries,
            projects: projects,
            userName: currentUser?.name,
        };
    }, [currentUser, adminStatsView, allTimeEntries, allProjects, timeEntries, projects, users, t]);


    const renderScreen = () => {
        switch (screen) {
            case 'history':
                 return <TimeEntryListScreen
                            entries={timeEntries}
                            projects={projects}
                            onAdd={() => handleOpenTimeEntryModal(null)}
                            onEdit={(entry) => handleOpenTimeEntryModal(entry)}
                            onDelete={handleDeleteTimeEntry}
                            onHapticTrigger={triggerHaptic}
                            t={t}
                            language={language}
                        />;
            case 'stats':
                return <StatsDashboard 
                            {...statsData}
                            hourlyRate={hourlyRate} 
                            currency={currency} 
                            t={t}
                            language={language}
                            isAdmin={!!currentUser?.isAdmin}
                            allUsers={users}
                            adminView={adminStatsView}
                            setAdminView={setAdminStatsView}
                       />;
            case 'projects':
                return <ProjectList 
                            projects={projects} 
                            onSelectProject={handleSelectProject} 
                            activeProjectId={isSessionActive ? persistentTimer.projectId : activeProjectId}
                            onCreateProject={() => handleOpenProjectModal(null)}
                            onEditProject={(p) => handleOpenProjectModal(p)}
                            onDeleteProject={handleDeleteProject}
                            onHapticTrigger={triggerHaptic}
                            t={t}
                       />;
            case 'settings':
                return <SettingsScreen
                            currentUser={currentUser}
                            onSwitchUser={handleSwitchUser}
                            hourlyRate={hourlyRate}
                            setHourlyRate={setHourlyRate}
                            currency={currency}
                            setCurrency={setCurrency}
                            onExport={handleExportData}
                            onImport={handleImportData}
                            onReset={handleResetData}
                            t={t}
                            language={language}
                            setLanguage={setLanguage}
                       />;
            case 'timer':
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full pt-16 pb-32">
                        <TimerDisplay 
                          elapsedTime={displayTime} 
                          earnings={currentEarnings} 
                          activeProject={isSessionActive ? projectForTimer : selectedProject} 
                          currency={currency}
                          isActive={!persistentTimer.isPaused && isSessionActive}
                          t={t}
                          language={language}
                        />
                        <div className="absolute bottom-[10rem] flex items-center justify-center w-full">
                           {!isSessionActive ? (
                                <FloatingButton onClick={() => handleStartTimer()} ariaLabel={t('startTimer')} className="w-24 h-24">
                                    <PlayIcon />
                                </FloatingButton>
                           ) : (
                               <div className="flex items-end gap-8">
                                    <FloatingButton 
                                      onClick={persistentTimer.isPaused ? handleResumeTimer : handlePauseTimer} 
                                      ariaLabel={persistentTimer.isPaused ? t('resumeTimer') : t('pauseTimer')} 
                                      className="w-24 h-24"
                                    >
                                      {persistentTimer.isPaused ? <PlayIcon /> : <PauseIcon />}
                                    </FloatingButton>
                                    <FloatingButton onClick={handleStopTimer} ariaLabel={t('stopTimer')} className="w-20 h-20">
                                       <StopIcon />
                                    </FloatingButton>
                               </div>
                           )}
                        </div>
                    </div>
                );
        }
    };
    
    if (!isLoaded) return <SplashScreen t={t} />;
    
    if (!currentUser) {
        return <UserSelectionScreen users={users} onSelectUser={handleSelectUser} onCreateUser={handleCreateUser} t={t} />;
    }

    return (
        <main className="w-full max-w-lg mx-auto h-full bg-[#000010] flex flex-col items-center justify-center">
            <div className="w-full h-full bg-[#0A0A15] text-white overflow-hidden relative shadow-2xl shadow-black/50 border-4 border-gray-800 rounded-[60px]">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full z-50"></div>
                
                {isOffline && <OfflineIndicator t={t} />}

                <div className="w-full h-full overflow-y-auto pt-12 pb-24 bg-gradient-to-b from-[#000010] to-[#0A0A15]">
                    {renderScreen()}
                </div>

                <BottomNav activeScreen={screen} setActiveScreen={(s) => { triggerHaptic('light'); setScreen(s); }} onHapticTrigger={() => triggerHaptic('light')} t={t} />
            </div>
             {isProjectModalOpen && (
                <ProjectModal
                    project={editingProject}
                    onClose={handleCloseProjectModal}
                    onSave={handleSaveProject}
                    t={t}
                />
            )}
             {isTimeEntryModalOpen && (
                <TimeEntryModal
                    entry={editingTimeEntry}
                    projects={projects}
                    onClose={handleCloseTimeEntryModal}
                    onSave={handleSaveTimeEntry}
                    t={t}
                />
            )}
        </main>
    );
}

const SplashScreen: React.FC<{ t: (key: string) => string }> = ({ t }) => {
    return (
        <div className="fixed inset-0 bg-gradient-to-b from-[#000010] to-[#0A0A15] flex flex-col items-center justify-center animate-fadeIn">
            <div className="animate-pulse-slow">
                <AppIcon className="w-32 h-32" />
            </div>
            <h1 className="font-display text-4xl font-extrabold text-white mt-8 tracking-wider">
                FlowTime Pro
            </h1>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.05); opacity: 1; }
                }
                .animate-fadeIn { animation: fadeIn 1s ease-in-out; }
                .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
            `}</style>
        </div>
    );
}
