import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Project, TimeEntry, Screen, User } from './types';
import { useLocalStorage, useHapticFeedback, useTranslation } from './hooks';
import { 
    BottomNav, TimerDisplay, StatsDashboard, ProjectList, ProjectModal, SettingsScreen, UserSelectionScreen, 
    OfflineIndicator, FloatingButton, PlayIcon, PauseIcon, StopIcon, TimeEntryListScreen, TimeEntryModal
} from './components';

// Initial data for a new user
const initialProjects: Project[] = [];
const initialTimeEntries: TimeEntry[] = [];

function App() {
  const { t, setLanguage, language } = useTranslation();
  const triggerHaptic = useHapticFeedback();
  
  // --- State Management ---
  const [users, setUsers] = useLocalStorage<User[]>('flowtime_users', []);
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>('flowtime_current_user', null);
  
  const [projects, setProjects] = useLocalStorage<Project[]>(`flowtime_projects_${currentUserId}`, initialProjects);
  const [timeEntries, setTimeEntries] = useLocalStorage<TimeEntry[]>(`flowtime_entries_${currentUserId}`, initialTimeEntries);
  
  const [activeScreen, setActiveScreen] = useState<Screen>('timer');
  const [hourlyRate, setHourlyRate] = useLocalStorage<number>(`flowtime_rate_${currentUserId}`, 1000);
  const [currency, setCurrency] = useLocalStorage<string>(`flowtime_currency_${currentUserId}`, 'CZK');
  
  // Timer specific state
  const [activeTimer, setActiveTimer] = useState<{ id: string, startTime: number, projectId: string, duration: number } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Modal states
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isTimeEntryModalOpen, setTimeEntryModalOpen] = useState(false);
  const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | null>(null);
  
  // Online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Stats admin view
  const [adminView, setAdminView] = useState('all');

  const currentUser = useMemo(() => users.find(u => u.id === currentUserId), [users, currentUserId]);
  const activeProject = useMemo(() => projects.find(p => p.id === activeTimer?.projectId), [projects, activeTimer]);
  const earnings = (elapsedTime / 3600) * hourlyRate;

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

  // Reset data if user changes
  useEffect(() => {
    if (currentUserId) {
        setProjects(JSON.parse(localStorage.getItem(`flowtime_projects_${currentUserId}`) || '[]'));
        setTimeEntries(JSON.parse(localStorage.getItem(`flowtime_entries_${currentUserId}`) || '[]'));
        setHourlyRate(JSON.parse(localStorage.getItem(`flowtime_rate_${currentUserId}`) || '1000'));
        setCurrency(JSON.parse(localStorage.getItem(`flowtime_currency_${currentUserId}`) || '"CZK"'));
    }
  }, [currentUserId, setProjects, setTimeEntries, setHourlyRate, setCurrency]);


  // --- Handlers ---
  const handleSelectUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const handleCreateUser = (name: string) => {
    const newUser: User = { id: `user_${Date.now()}`, name };
    // Check for admin
    if (name.toLowerCase().includes('admin')) {
      newUser.isAdmin = true;
    }
    setUsers([...users, newUser]);
    setCurrentUserId(newUser.id);
  };
  
  const handleSwitchUser = () => {
      setCurrentUserId(null);
  };
  
  const handleSelectProject = useCallback((projectId: string) => {
      if (activeTimer) {
          // If timer is running, stop it and start a new one with the new project
          handleStopTimer(true); // silent stop
          handleStartTimer(projectId);
      } else {
          // If timer is not running, just set it as the one to be used next
           const newTimer = { id: `temp_${Date.now()}`, startTime: Date.now(), projectId, duration: 0 };
           setActiveTimer(newTimer);
           setElapsedTime(0); // Reset elapsed time when project changes while stopped
           setIsPaused(true); // Stay paused
      }
      triggerHaptic('light');
  }, [activeTimer, triggerHaptic]);


  const handleStartTimer = (selectedProjectId?: string) => {
    const projectId = selectedProjectId || activeTimer?.projectId;
    if (!projectId) {
      alert(t('selectProjectFirst'));
      return;
    }
    const newTimer = { id: `entry_${Date.now()}`, startTime: Date.now(), projectId, duration: 0 };
    setActiveTimer(newTimer);
    setElapsedTime(0);
    setIsPaused(false);
    triggerHaptic('success');
  };
  
  const handlePauseTimer = () => {
    if (!activeTimer) return;
    const pausedDuration = activeTimer.duration + (Date.now() - activeTimer.startTime) / 1000;
    setActiveTimer(prev => prev ? { ...prev, duration: pausedDuration } : null);
    setIsPaused(true);
    triggerHaptic('light');
  };

  const handleResumeTimer = () => {
      if (!activeTimer) return;
      setActiveTimer(prev => prev ? { ...prev, startTime: Date.now() } : null);
      setIsPaused(false);
      triggerHaptic('light');
  };

  const handleStopTimer = (silent = false) => {
    if (!activeTimer) return;
    const endTime = Date.now();
    const finalDuration = activeTimer.duration + (isPaused ? 0 : (endTime - activeTimer.startTime) / 1000);

    const newEntry: TimeEntry = {
      id: activeTimer.id,
      projectId: activeTimer.projectId,
      startTime: activeTimer.startTime - (activeTimer.duration * 1000), // Adjust start time based on total duration before this last segment started.
      endTime: endTime,
      duration: finalDuration,
      userId: currentUserId!,
    };
    setTimeEntries(prev => [...prev, newEntry]);
    setActiveTimer(null);
    setElapsedTime(0);
    setIsPaused(false);
    if (!silent) {
        triggerHaptic('success');
    }
  };
  
  // Project CRUD
  const handleSaveProject = (projectData: { name: string, color: string }) => {
    if (editingProject) {
      setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...projectData } : p));
    } else {
      const newProject: Project = { id: `proj_${Date.now()}`, userId: currentUserId!, ...projectData };
      setProjects([...projects, newProject]);
    }
    setProjectModalOpen(false);
    setEditingProject(null);
  };
  
  const handleDeleteProject = (projectId: string) => {
     const entriesForProject = timeEntries.filter(e => e.projectId === projectId);
     let confirmed = false;
     if (entriesForProject.length > 0) {
        confirmed = window.confirm(t('deleteProjectWithEntriesConfirm', entriesForProject.length));
        if (confirmed) {
            setTimeEntries(timeEntries.filter(e => e.projectId !== projectId));
        }
     } else {
        confirmed = window.confirm(t('deleteProjectConfirm'));
     }

     if (confirmed) {
        setProjects(projects.filter(p => p.id !== projectId));
        triggerHaptic('error');
     }
  };
  
  // Time Entry CRUD
  const handleSaveTimeEntry = (entryData: { projectId: string, startTime: number, endTime: number }) => {
      const duration = (entryData.endTime - entryData.startTime) / 1000;
      if (editingTimeEntry) {
          setTimeEntries(entries => entries.map(e => e.id === editingTimeEntry.id ? { ...e, ...entryData, duration } : e));
      } else {
          const newEntry: TimeEntry = {
              id: `entry_${Date.now()}`,
              userId: currentUserId!,
              ...entryData,
              duration,
          };
          setTimeEntries(entries => [...entries, newEntry]);
      }
      setTimeEntryModalOpen(false);
      setEditingTimeEntry(null);
  };
  
  const handleDeleteTimeEntry = (entryId: string) => {
      if (window.confirm(t('deleteEntryConfirm'))) {
          setTimeEntries(entries => entries.filter(e => e.id !== entryId));
          triggerHaptic('error');
      }
  };

  // Data Management
  const handleExport = () => {
    try {
      const data = {
        projects,
        timeEntries,
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `flowtime_pro_backup_${currentUser?.name}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (e) {
      alert(t('exportError'));
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm(t('importConfirm'))) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File not read as text");
        const data = JSON.parse(text);
        
        // Basic validation
        if (Array.isArray(data.projects) && Array.isArray(data.timeEntries)) {
          // Add user ID to imported data
          const importedProjects = data.projects.map((p: any) => ({...p, userId: currentUserId}));
          const importedEntries = data.timeEntries.map((e: any) => ({...e, userId: currentUserId}));
          setProjects(prev => [...prev, ...importedProjects]);
          setTimeEntries(prev => [...prev, ...importedEntries]);
          alert(t('importSuccess'));
        } else {
          throw new Error("Invalid file structure");
        }
      } catch (error) {
        alert(t('importError'));
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  const handleReset = () => {
    if (currentUser && window.confirm(t('resetConfirm', currentUser.name))) {
      setProjects([]);
      setTimeEntries([]);
      alert(t('resetSuccess', currentUser.name));
    }
  };

  // --- Render Logic ---
  const renderScreen = () => {
    switch(activeScreen) {
      case 'stats':
        return <StatsDashboard 
                    entries={timeEntries} 
                    projects={projects} 
                    hourlyRate={hourlyRate}
                    currency={currency}
                    userName={currentUser?.name}
                    t={t}
                    language={language}
                    isAdmin={currentUser?.isAdmin || false}
                    allUsers={users}
                    adminView={adminView}
                    setAdminView={setAdminView}
                />;
      case 'projects':
        return <ProjectList 
                    projects={projects} 
                    onSelectProject={handleSelectProject} 
                    activeProjectId={activeTimer?.projectId}
                    onCreateProject={() => { setEditingProject(null); setProjectModalOpen(true); }}
                    onEditProject={(p) => { setEditingProject(p); setProjectModalOpen(true); }}
                    onDeleteProject={handleDeleteProject}
                    onHapticTrigger={triggerHaptic}
                    t={t}
                />;
      case 'settings':
        return <SettingsScreen 
                    hourlyRate={hourlyRate}
                    setHourlyRate={setHourlyRate}
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
        return <TimeEntryListScreen 
                    entries={timeEntries} 
                    projects={projects} 
                    onAdd={() => { setEditingTimeEntry(null); setTimeEntryModalOpen(true); }}
                    onEdit={(e) => { setEditingTimeEntry(e); setTimeEntryModalOpen(true); }}
                    onDelete={handleDeleteTimeEntry}
                    onHapticTrigger={triggerHaptic}
                    t={t}
                    language={language}
                />
      case 'timer':
      default:
        return (
            <div className="flex flex-col items-center justify-center h-full gap-8">
                <TimerDisplay 
                    elapsedTime={elapsedTime} 
                    earnings={earnings} 
                    activeProject={activeProject}
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
                         <FloatingButton onClick={activeTimer ? handleResumeTimer : handleStartTimer} ariaLabel={activeTimer ? t('resumeTimer') : t('startTimer')} className="w-20 h-20" disabled={!activeTimer?.projectId}>
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
    return <UserSelectionScreen users={users} onSelectUser={handleSelectUser} onCreateUser={handleCreateUser} t={t} />;
  }

  return (
    <div className="h-[100dvh] w-full text-white bg-gradient-to-b from-[#000010] to-[#0A0A15] overflow-hidden flex flex-col">
        {!isOnline && <OfflineIndicator t={t} />}
        <main className="flex-grow overflow-y-auto pb-28">
            {renderScreen()}
        </main>
        
        {isProjectModalOpen && <ProjectModal 
            project={editingProject} 
            onClose={() => setProjectModalOpen(false)} 
            onSave={handleSaveProject} 
            t={t}
        />}

        {isTimeEntryModalOpen && <TimeEntryModal 
            entry={editingTimeEntry}
            projects={projects}
            onClose={() => setTimeEntryModalOpen(false)}
            onSave={handleSaveTimeEntry}
            t={t}
        />}
        
      <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} onHapticTrigger={() => triggerHaptic('light')} t={t}/>
    </div>
  );
}

export default App;
