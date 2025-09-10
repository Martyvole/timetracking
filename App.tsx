import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Installation, TimeEntry, PanelEntry, WorkEntry, Screen, User, Task } from './types';
import { useLocalStorage, useHapticFeedback, useTranslation } from './hooks';
import { 
    BottomNav, TimerDisplay, StatsDashboard, InstallationList, InstallationModal, SettingsScreen, UserSelectionScreen, 
    OfflineIndicator, FloatingButton, PlayIcon, PauseIcon, StopIcon, WorkLogScreen, TimeEntryModal, PanelLogModal, AddEntryChoiceModal, AdminLoginModal,
    WorkEntryDetailModal, TaskManagementModal
} from './components';

// Initial data for a new user
const initialInstallations: Installation[] = [];
const initialWorkEntries: WorkEntry[] = [];
const initialTasks: Task[] = [];
const ADMIN_PASSWORD = 'Zacnetemakathovada2025';
const ADMIN_USER: User = { id: 'admin', name: 'Admin', isAdmin: true };

function App() {
  const { t, setLanguage, language } = useTranslation();
  const triggerHaptic = useHapticFeedback();
  
  // --- State Management ---
  const [users, setUsers] = useLocalStorage<User[]>('solarwork_users', []);
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>('solarwork_current_user', null);
  
  // Data for the current logged-in user
  const [installations, setInstallations] = useLocalStorage<Installation[]>(`solarwork_installations_${currentUserId}`, initialInstallations);
  const [workEntries, setWorkEntries] = useLocalStorage<WorkEntry[]>(`solarwork_entries_${currentUserId}`, initialWorkEntries);
  const [tasks, setTasks] = useLocalStorage<Task[]>(`solarwork_tasks_${currentUserId}`, initialTasks);

  // Aggregated data for admin view
  const [allWorkEntries, setAllWorkEntries] = useState<WorkEntry[]>([]);
  const [allInstallations, setAllInstallations] = useState<Installation[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  const [activeScreen, setActiveScreen] = useState<Screen>('timer');
  const [hourlyWage, setHourlyWage] = useLocalStorage<number>(`solarwork_wage_${currentUserId}`, 15);
  const [panelRate, setPanelRate] = useLocalStorage<number>(`solarwork_panelrate_${currentUserId}`, 5);
  const [currency, setCurrency] = useLocalStorage<string>(`solarwork_currency_${currentUserId}`, 'EUR');
  
  // Timer specific state
  const [activeTimer, setActiveTimer] = useState<{ id: string, startTime: number, installationId: string, duration: number } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Modal states
  const [isInstallationModalOpen, setInstallationModalOpen] = useState(false);
  const [editingInstallation, setEditingInstallation] = useState<Installation | null>(null);
  const [isTimeEntryModalOpen, setTimeEntryModalOpen] = useState(false);
  const [isPanelLogModalOpen, setPanelLogModalOpen] = useState(false);
  const [isAddEntryChoiceModalOpen, setAddEntryChoiceModalOpen] = useState(false);
  const [editingWorkEntry, setEditingWorkEntry] = useState<WorkEntry | null>(null);
  const [isAdminLoginOpen, setAdminLoginOpen] = useState(false);
  const [detailViewEntry, setDetailViewEntry] = useState<WorkEntry | null>(null);
  const [managingTasksForInstallation, setManagingTasksForInstallation] = useState<Installation | null>(null);
  
  // Online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Stats admin view
  const [adminView, setAdminView] = useState('all');

  const currentUser = useMemo(() => users.find(u => u.id === currentUserId), [users, currentUserId]);
  const activeInstallation = useMemo(() => installations.find(p => p.id === activeTimer?.installationId), [installations, activeTimer]);
  const earnings = (elapsedTime / 3600) * hourlyWage;

  // --- Effects ---
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (activeTimer && !isPaused) {
      interval = window.setInterval(() => {
        setElapsedTime(activeTimer.duration + (Date.now() - activeTimer.startTime) / 1000);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, isPaused]);

  // Load correct data based on user (admin or regular)
  useEffect(() => {
    if (!currentUserId) return;
    
    const loggedInUser = users.find(u => u.id === currentUserId);

    if (loggedInUser?.isAdmin) {
        // Admin user: aggregate data from all other users
        const otherUsers = users.filter(u => !u.isAdmin);
        const aggregatedEntries: WorkEntry[] = [];
        const aggregatedInstallations: Installation[] = [];
        const aggregatedTasks: Task[] = [];
        
        otherUsers.forEach(user => {
            const userEntries = JSON.parse(localStorage.getItem(`solarwork_entries_${user.id}`) || '[]') as WorkEntry[];
            const userInstallations = JSON.parse(localStorage.getItem(`solarwork_installations_${user.id}`) || '[]') as Installation[];
            const userTasks = JSON.parse(localStorage.getItem(`solarwork_tasks_${user.id}`) || '[]') as Task[];
            aggregatedEntries.push(...userEntries);
            aggregatedInstallations.push(...userInstallations);
            aggregatedTasks.push(...userTasks);
        });

        setAllWorkEntries(aggregatedEntries);
        setAllInstallations(aggregatedInstallations);
        setAllTasks(aggregatedTasks);

        // Load admin's own settings, but clear personal data displays
        setInstallations([]);
        setWorkEntries([]);
        setTasks([]);
        setHourlyWage(JSON.parse(localStorage.getItem(`solarwork_wage_admin`) || '15'));
        setPanelRate(JSON.parse(localStorage.getItem(`solarwork_panelrate_admin`) || '5'));
        setCurrency(JSON.parse(localStorage.getItem(`solarwork_currency_admin`) || '"EUR"'));
    
    } else {
        // Regular user: load their own data
        setInstallations(JSON.parse(localStorage.getItem(`solarwork_installations_${currentUserId}`) || '[]'));
        setWorkEntries(JSON.parse(localStorage.getItem(`solarwork_entries_${currentUserId}`) || '[]'));
        setTasks(JSON.parse(localStorage.getItem(`solarwork_tasks_${currentUserId}`) || '[]'));
        setHourlyWage(JSON.parse(localStorage.getItem(`solarwork_wage_${currentUserId}`) || '15'));
        setPanelRate(JSON.parse(localStorage.getItem(`solarwork_panelrate_${currentUserId}`) || '5'));
        setCurrency(JSON.parse(localStorage.getItem(`solarwork_currency_${currentUserId}`) || '"EUR"'));
        // Clear admin data
        setAllWorkEntries([]);
        setAllInstallations([]);
        setAllTasks([]);
    }
  }, [currentUserId, users, setInstallations, setWorkEntries, setTasks, setHourlyWage, setPanelRate, setCurrency]);


  // --- Handlers ---
  const handleSelectUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const handleCreateUser = (name: string) => {
    const newUser: User = { id: `user_${Date.now()}`, name };
    setUsers([...users, newUser]);
    setCurrentUserId(newUser.id);
  };
  
  const handleAdminLogin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
        if (!users.find(u => u.id === ADMIN_USER.id)) {
            setUsers(prev => [...prev, ADMIN_USER]);
        }
        setCurrentUserId(ADMIN_USER.id);
        setAdminLoginOpen(false);
    } else {
        alert(t('wrongPassword'));
    }
  };

  const handleSwitchUser = () => {
      setCurrentUserId(null);
  };
  
  const handleStartTimer = useCallback((selectedInstallationId?: string) => {
    const installationId = selectedInstallationId || activeTimer?.installationId;
    if (!installationId) {
      alert(t('selectInstallationFirst'));
      return;
    }
    if (currentUser?.isAdmin) {
      alert(t('adminCannotTrackTime'));
      return;
    }
    const newTimer = { id: `entry_${Date.now()}`, startTime: Date.now(), installationId, duration: 0 };
    setActiveTimer(newTimer);
    setElapsedTime(0);
    setIsPaused(false);
    triggerHaptic('success');
  }, [activeTimer, currentUser, t, triggerHaptic]);

  const handleStopTimer = useCallback((silent = false) => {
    if (!activeTimer) return;
    const endTime = Date.now();
    const finalDuration = activeTimer.duration + (isPaused ? 0 : (endTime - activeTimer.startTime) / 1000);

    const newEntry: TimeEntry = {
      id: activeTimer.id,
      type: 'hourly',
      installationId: activeTimer.installationId,
      startTime: activeTimer.startTime - (activeTimer.duration * 1000),
      endTime: endTime,
      duration: finalDuration,
      userId: currentUserId!,
    };
    setWorkEntries(prev => [...prev, newEntry]);
    setActiveTimer(null);
    setElapsedTime(0);
    setIsPaused(false);
    if (!silent) {
        triggerHaptic('success');
    }
  }, [activeTimer, isPaused, currentUserId, setWorkEntries, triggerHaptic]);
  
  const handleSelectInstallation = useCallback((installationId: string) => {
      if (activeTimer) {
          handleStopTimer(true); // silent stop
          handleStartTimer(installationId);
      } else {
           const newTimer = { id: `temp_${Date.now()}`, startTime: Date.now(), installationId, duration: 0 };
           setActiveTimer(newTimer);
           setElapsedTime(0);
           setIsPaused(true);
      }
      triggerHaptic('light');
  }, [activeTimer, triggerHaptic, handleStartTimer, handleStopTimer]);
  
  const handlePauseTimer = useCallback(() => {
    if (!activeTimer) return;
    const pausedDuration = activeTimer.duration + (Date.now() - activeTimer.startTime) / 1000;
    setActiveTimer(prev => prev ? { ...prev, duration: pausedDuration } : null);
    setIsPaused(true);
    triggerHaptic('light');
  }, [activeTimer, triggerHaptic]);

  const handleResumeTimer = useCallback(() => {
      if (!activeTimer) return;
      setActiveTimer(prev => prev ? { ...prev, startTime: Date.now() } : null);
      setIsPaused(false);
      triggerHaptic('light');
  }, [activeTimer, triggerHaptic]);
  
  // Installation CRUD
  const handleSaveInstallation = useCallback((installationData: { name: string, color: string }) => {
    if (editingInstallation) {
      setInstallations(prev => prev.map(p => p.id === editingInstallation.id ? { ...p, ...installationData } : p));
    } else {
      const newInstallation: Installation = { id: `proj_${Date.now()}`, userId: currentUserId!, ...installationData };
      setInstallations(prev => [...prev, newInstallation]);
    }
    setInstallationModalOpen(false);
    setEditingInstallation(null);
  }, [editingInstallation, currentUserId, setInstallations]);
  
  const handleDeleteInstallation = useCallback((installationId: string) => {
     const entriesForInstallation = workEntries.filter(e => e.installationId === installationId);
     let confirmed = false;
     if (entriesForInstallation.length > 0) {
        confirmed = window.confirm(t('deleteInstallationWithEntriesConfirm', entriesForInstallation.length));
        if (confirmed) {
            setWorkEntries(prev => prev.filter(e => e.installationId !== installationId));
        }
     } else {
        confirmed = window.confirm(t('deleteInstallationConfirm'));
     }

     if (confirmed) {
        setInstallations(prev => prev.filter(p => p.id !== installationId));
        setTasks(prev => prev.filter(t => t.installationId !== installationId));
        triggerHaptic('error');
     }
  }, [workEntries, t, triggerHaptic, setWorkEntries, setInstallations, setTasks]);

  // Task CRUD
    const handleAddTask = useCallback((name: string) => {
        if (!managingTasksForInstallation) return;
        const newTask: Task = {
            id: `task_${Date.now()}`,
            name,
            installationId: managingTasksForInstallation.id,
            userId: currentUserId!,
        };
        setTasks(prev => [...prev, newTask]);
    }, [managingTasksForInstallation, currentUserId, setTasks]);

    const handleDeleteTask = useCallback((taskId: string) => {
        const entriesWithTask = workEntries.filter(e => e.taskId === taskId);
        let confirmed = false;
        if (entriesWithTask.length > 0) {
            confirmed = window.confirm(t('deleteTaskConfirm', entriesWithTask.length));
            if (confirmed) {
                setWorkEntries(prev => prev.map(e => e.taskId === taskId ? { ...e, taskId: undefined } : e));
            }
        } else {
            confirmed = window.confirm(t('deleteTaskConfirmNoEntries'));
        }

        if (confirmed) {
            setTasks(prev => prev.filter(t => t.id !== taskId));
            triggerHaptic('error');
        }
    }, [workEntries, t, triggerHaptic, setTasks, setWorkEntries]);
  
  // Work Entry CRUD
  const handleSaveTimeEntry = useCallback((entryData: { installationId: string, startTime: number, endTime: number, taskId?: string, notes?: string }) => {
      const duration = (entryData.endTime - entryData.startTime) / 1000;
      if (editingWorkEntry) {
          setWorkEntries(entries => entries.map(e => e.id === editingWorkEntry.id ? { ...e, ...entryData, duration, type: 'hourly' } as TimeEntry : e));
      } else {
          const newEntry: TimeEntry = {
              id: `entry_${Date.now()}`,
              type: 'hourly',
              userId: currentUserId!,
              ...entryData,
              duration,
              endTime: entryData.endTime,
          };
          setWorkEntries(entries => [...entries, newEntry]);
      }
      setTimeEntryModalOpen(false);
      setEditingWorkEntry(null);
  }, [editingWorkEntry, currentUserId, setWorkEntries]);

  const handleSavePanelEntry = useCallback((entryData: { installationId: string, date: number, count: number, taskId?: string, notes?: string }) => {
      if (editingWorkEntry) {
          setWorkEntries(entries => entries.map(e => e.id === editingWorkEntry.id ? { ...e, ...entryData, type: 'panels' } as PanelEntry : e));
      } else {
           const newEntry: PanelEntry = {
              id: `panel_${Date.now()}`,
              type: 'panels',
              userId: currentUserId!,
              ...entryData,
          };
          setWorkEntries(entries => [...entries, newEntry]);
      }
      setPanelLogModalOpen(false);
      setEditingWorkEntry(null);
  }, [editingWorkEntry, currentUserId, setWorkEntries]);
  
  const handleDeleteWorkEntry = useCallback((entryId: string) => {
      if (window.confirm(t('deleteEntryConfirm'))) {
          setWorkEntries(entries => entries.filter(e => e.id !== entryId));
          setDetailViewEntry(null);
          triggerHaptic('error');
      }
  }, [t, triggerHaptic, setWorkEntries]);

    const handleAddEntry = useCallback((type: 'time' | 'panel') => {
        setAddEntryChoiceModalOpen(false);
        setEditingWorkEntry(null);
        if (type === 'time') {
            setTimeEntryModalOpen(true);
        } else {
            setPanelLogModalOpen(true);
        }
    }, []);

    const handleEditEntry = useCallback((entry: WorkEntry) => {
        setDetailViewEntry(null);
        setEditingWorkEntry(entry);
        if (entry.type === 'hourly') {
            setTimeEntryModalOpen(true);
        } else {
            setPanelLogModalOpen(true);
        }
    }, []);

  // Data Management
  const handleExport = useCallback(() => {
    try {
      const data = { installations, workEntries, tasks };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `solar_work_report_backup_${currentUser?.name}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (e) {
      alert(t('exportError'));
    }
  }, [installations, workEntries, tasks, currentUser, t]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!window.confirm(t('importConfirm'))) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File not read as text");
        const data = JSON.parse(text);
        if (Array.isArray(data.installations) && Array.isArray(data.workEntries)) {
          const importedInstallations = data.installations.map((p: any) => ({...p, userId: currentUserId}));
          const importedEntries = data.workEntries.map((e: any) => ({...e, userId: currentUserId}));
          const importedTasks = (data.tasks || []).map((t: any) => ({...t, userId: currentUserId}));
          setInstallations(prev => [...prev, ...importedInstallations]);
          setWorkEntries(prev => [...prev, ...importedEntries]);
          setTasks(prev => [...prev, ...importedTasks]);
          alert(t('importSuccess'));
        } else {
          throw new Error("Invalid file structure");
        }
      } catch (error) {
        alert(t('importError'));
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [currentUserId, t, setInstallations, setWorkEntries, setTasks]);

  const handleReset = useCallback(() => {
    if (currentUser && window.confirm(t('resetConfirm', currentUser.name))) {
      setInstallations([]);
      setWorkEntries([]);
      setTasks([]);
      alert(t('resetSuccess', currentUser.name));
    }
  }, [currentUser, t, setInstallations, setWorkEntries, setTasks]);

  // --- Memos for display data ---
  const displayedEntries = useMemo(() => {
    if (currentUser?.isAdmin) {
      if (adminView === 'all') {
        return allWorkEntries;
      }
      return allWorkEntries.filter(e => e.userId === adminView);
    }
    return workEntries;
  }, [currentUser, adminView, workEntries, allWorkEntries]);

  const displayedInstallations = useMemo(() => {
    if (currentUser?.isAdmin) {
      if (adminView === 'all') {
        return allInstallations;
      }
       return allInstallations.filter(p => p.userId === adminView);
    }
    return installations;
  }, [currentUser, adminView, installations, allInstallations]);

  const displayedTasks = useMemo(() => {
      return currentUser?.isAdmin ? allTasks : tasks;
  }, [currentUser, tasks, allTasks]);


  // --- Render Logic ---
  const renderScreen = () => {
    switch(activeScreen) {
      case 'stats':
        return <StatsDashboard 
                    entries={displayedEntries} 
                    hourlyWage={hourlyWage}
                    panelRate={panelRate}
                    currency={currency}
                    userName={currentUser?.name}
                    t={t}
                    language={language}
                    isAdmin={currentUser?.isAdmin || false}
                    allUsers={users}
                    adminView={adminView}
                    setAdminView={setAdminView}
                />;
      case 'installations':
        return <InstallationList 
                    installations={displayedInstallations} 
                    onSelectInstallation={handleSelectInstallation} 
                    activeInstallationId={activeTimer?.installationId}
                    onCreateInstallation={() => { setEditingInstallation(null); setInstallationModalOpen(true); }}
                    onEditInstallation={(p) => { setEditingInstallation(p); setInstallationModalOpen(true); }}
                    onDeleteInstallation={handleDeleteInstallation}
                    onManageTasks={setManagingTasksForInstallation}
                    onHapticTrigger={triggerHaptic}
                    t={t}
                    isReadOnly={currentUser?.isAdmin}
                />;
      case 'settings':
        return <SettingsScreen 
                    hourlyWage={hourlyWage}
                    setHourlyWage={setHourlyWage}
                    panelRate={panelRate}
                    setPanelRate={setPanelRate}
                    currency={currency}
                    setCurrency={setCurrency}
                    onExport={handleExport}
                    onImport={handleImport}
                    onReset={handleReset}
                    currentUser={currentUser}
                    onSwitchUser={handleSwitchUser}
                    t={t}
                    language={language}
                    setLanguage={setLanguage}
                />;
      case 'history':
        return <WorkLogScreen 
                    entries={displayedEntries} 
                    installations={displayedInstallations} 
                    onAdd={() => setAddEntryChoiceModalOpen(true)}
                    onViewDetails={setDetailViewEntry}
                    onHapticTrigger={triggerHaptic}
                    t={t}
                    language={language}
                    isReadOnly={currentUser?.isAdmin}
                />
      case 'timer':
      default:
        return (
            <div className="flex flex-col items-center justify-center h-full gap-8 fade-in">
                <TimerDisplay 
                    elapsedTime={elapsedTime} 
                    earnings={earnings} 
                    activeInstallation={activeInstallation}
                    currency={currency}
                    isActive={!!activeTimer && !isPaused}
                    t={t}
                    language={language}
                />
                <div className="flex items-center gap-6">
                    {activeTimer && !isPaused && (
                         <FloatingButton onClick={handlePauseTimer} ariaLabel={t('pauseTimer')} className="w-20 h-20">
                            <PauseIcon />
                         </FloatingButton>
                    )}
                     {(isPaused || !activeTimer) && (
                         <FloatingButton onClick={activeTimer ? handleResumeTimer : handleStartTimer} ariaLabel={activeTimer ? t('resumeTimer') : t('startTimer')} className="w-20 h-20" disabled={!activeTimer?.installationId}>
                            <PlayIcon />
                         </FloatingButton>
                    )}
                    <FloatingButton onClick={() => handleStopTimer()} ariaLabel={t('stopTimer')} className="w-28 h-28" disabled={!activeTimer}>
                        <StopIcon />
                    </FloatingButton>
                </div>
            </div>
        )
    }
  };

  if (!currentUser) {
    return (
        <>
            <UserSelectionScreen 
                users={users} 
                onSelectUser={handleSelectUser} 
                onCreateUser={handleCreateUser}
                onAdminLoginRequest={() => setAdminLoginOpen(true)}
                t={t} 
            />
            {isAdminLoginOpen && <AdminLoginModal 
                onClose={() => setAdminLoginOpen(false)}
                onLogin={handleAdminLogin}
                t={t}
            />}
        </>
    );
  }

  return (
    <div className="h-[100dvh] w-full text-white bg-[var(--primary)] overflow-hidden flex flex-col">
        {!isOnline && <OfflineIndicator t={t} />}
        <main className="flex-grow overflow-y-auto pb-28">
            {renderScreen()}
        </main>
        
        {isInstallationModalOpen && <InstallationModal 
            installation={editingInstallation} 
            onClose={() => setInstallationModalOpen(false)} 
            onSave={handleSaveInstallation} 
            t={t}
        />}

        {managingTasksForInstallation && <TaskManagementModal
            installation={managingTasksForInstallation}
            tasks={tasks.filter(t => t.installationId === managingTasksForInstallation.id)}
            onClose={() => setManagingTasksForInstallation(null)}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            t={t}
        />}

        {isAddEntryChoiceModalOpen && <AddEntryChoiceModal
            onClose={() => setAddEntryChoiceModalOpen(false)}
            onSelect={handleAddEntry}
            t={t}
        />}

        {isTimeEntryModalOpen && <TimeEntryModal 
            entry={editingWorkEntry?.type === 'hourly' ? editingWorkEntry : null}
            installations={installations}
            tasks={tasks}
            onClose={() => { setTimeEntryModalOpen(false); setEditingWorkEntry(null); }}
            onSave={handleSaveTimeEntry}
            t={t}
        />}

        {isPanelLogModalOpen && <PanelLogModal 
            entry={editingWorkEntry?.type === 'panels' ? editingWorkEntry : null}
            installations={installations}
            tasks={tasks}
            onClose={() => { setPanelLogModalOpen(false); setEditingWorkEntry(null); }}
            onSave={handleSavePanelEntry}
            t={t}
        />}

        {detailViewEntry && <WorkEntryDetailModal 
            entry={detailViewEntry}
            installation={displayedInstallations.find(p => p.id === detailViewEntry.installationId)}
            tasks={displayedTasks}
            onClose={() => setDetailViewEntry(null)}
            onEdit={handleEditEntry}
            onDelete={handleDeleteWorkEntry}
            t={t}
            language={language}
            isReadOnly={currentUser?.isAdmin}
        />}
        
      <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} onHapticTrigger={() => triggerHaptic('light')} t={t}/>
    </div>
  );
}

export default App;