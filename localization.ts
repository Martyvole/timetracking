export const translations = {
  en: {
    // Nav
    timer: 'Timer',
    history: 'Logs',
    stats: 'Stats',
    installations: 'Installations',
    settings: 'Settings',

    // User Selection
    appName: 'MST',
    selectOrCreateProfile: 'Select or create a profile',
    enterNewUserName: 'Enter new user name...',
    createUser: 'Create User',

    // Admin Login
    adminLogin: 'Admin Login',
    password: 'Password',
    login: 'Login',
    wrongPassword: 'Wrong password.',

    // General UI
    offline: 'Offline',
    save: 'Save',
    cancel: 'Cancel',

    // Timer Screen
    noInstallationSelected: 'No Installation Selected',
    startTimer: 'Start Timer',
    pauseTimer: 'Pause Timer',
    resumeTimer: 'Resume Timer',
    stopTimer: 'Stop Timer',
    selectInstallationFirst: 'Please select an installation first.',
    adminCannotTrackTime: 'Admin cannot track time. Please switch to a user profile.',
    
    // History Screen
    historyTitle: 'Work Logs',
    noWorkLogs: 'No Work Logs Yet',
    noWorkLogsDesc: 'Your recorded sessions and panel logs will appear here.',
    today: 'Today',
    yesterday: 'Yesterday',
    unknownInstallation: 'Unknown Installation',
    deleteEntryConfirm: 'Are you sure you want to delete this work log?',
    addLog: 'Add Work Log',
    addEntryChoiceTitle: 'What to log?',
    addTimeEntry: 'Time Entry',
    addPanelLog: 'Panel Log',
    panels: 'panels',
    viewDetails: 'View Details',

    // Work Entry Detail Modal
    workEntryDetails: 'Work Entry Details',
    notes: 'Notes',
    photo: 'Photo',
    noNotes: 'No notes for this entry.',
    noPhoto: 'No photo attached.',
    duration: 'Duration',
    period: 'Period',

    // Time Entry Modal
    newTimeEntry: 'New Time Entry',
    editTimeEntry: 'Edit Time Entry',
    installation: 'Installation',
    selectInstallation: 'Select an installation',
    startDate: 'Start Date',
    startTime: 'Start Time',
    endDate: 'End Date',
    endTime: 'End Time',
    endTimeAfterStart: 'End time must be after start time.',
    addNote: 'Add a note (optional)',
    addPhoto: 'Add Photo',

    // Panel Log Modal
    newPanelLog: 'New Panel Log',
    editPanelLog: 'Edit Panel Log',
    date: 'Date',
    panelsInstalled: 'Panels Installed',
    invalidPanelCount: 'Please enter a valid panel count.',

    // Stats Screen
    statistics: 'Statistics',
    forUser: 'for {0}',
    totalHours: 'Total Hours',
    totalPanels: 'Total Panels',
    totalEarnings: 'Total Earnings',
    weeklyHours: 'Weekly Hours',
    allUsers: 'All Users',
    filterInstallation: 'Filter Installation',
    allInstallations: 'All Installations',
    generateAIReport: 'Generate AI Report',
    generatingReport: 'Generating Report...',
    weeklySummary: 'Weekly AI Summary',
    aiReportError: 'Could not generate AI report. Please try again later.',
    
    // Installations Screen
    installationsTitle: 'Installations',
    noInstallations: 'No Installations Yet',
    noInstallationsDesc: 'Click the \'+\' button to create your first installation site.',
    addInstallation: 'Add New Installation',
    edit: 'Edit',
    delete: 'Delete',
    deleteInstallationConfirm: 'Are you sure you want to delete this installation?',
    deleteInstallationWithEntriesConfirm: 'This installation has {0} work logs. Are you sure you want to delete it and all associated logs? This action cannot be undone.',

    // Installation Modal
    newInstallation: 'New Installation',
    editInstallation: 'Edit Installation',
    installationName: 'Installation Name (e.g. site address)',
    color: 'Color',
    
    // Settings Screen
    settingsTitle: 'Settings',
    userProfile: 'User Profile',
    loggedInAs: 'Logged in as:',
    switchUser: 'Switch User',
    rates: 'Rates',
    hourlyWage: 'Hourly Wage',
    ratePerPanel: 'Rate per Panel',
    currencySymbol: 'Currency Symbol (e.g., CZK, EUR, USD)',
    language: 'Language',
    dataManagement: 'Data Management',
    exportData: 'Export Data',
    importData: 'Import Data',
    dangerZone: 'Danger Zone',
    dangerZoneDesc: 'This action cannot be undone. This will permanently delete all your installations and work logs for the current user.',
    resetAllData: 'Reset All Data',
    exportError: 'Error exporting data.',
    importConfirm: 'Are you sure? This will add the imported installations and logs to the current user\'s data.',
    importSuccess: 'Data imported successfully!',
    importError: 'Error importing data. Please check the file format.',
    resetConfirm: 'DANGER: Are you sure you want to delete all installations and logs for {0}? This is irreversible.',
    // FIX: Add missing translation key for reset success message.
    resetSuccess: 'All data for {0} has been successfully reset.',
  },
  cs: {
    // Nav
    timer: 'Časovač',
    history: 'Záznamy',
    stats: 'Statistiky',
    installations: 'Instalace',
    settings: 'Nastavení',

    // User Selection
    appName: 'MST',
    selectOrCreateProfile: 'Vyberte nebo vytvořte profil',
    enterNewUserName: 'Zadejte jméno nového uživatele...',
    createUser: 'Vytvořit uživatele',

    // Admin Login
    adminLogin: 'Admin přihlášení',
    password: 'Heslo',
    login: 'Přihlásit',
    wrongPassword: 'Špatné heslo.',

    // General UI
    offline: 'Offline',
    save: 'Uložit',
    cancel: 'Zrušit',

    // Timer Screen
    noInstallationSelected: 'Není vybrána instalace',
    startTimer: 'Spustit časovač',
    pauseTimer: 'Pozastavit',
    resumeTimer: 'Pokračovat',
    stopTimer: 'Zastavit',
    selectInstallationFirst: 'Prosím, nejprve vyberte instalaci.',
    adminCannotTrackTime: 'Admin nemůže sledovat čas. Přepněte se na uživatelský profil.',
    
    // History Screen
    historyTitle: 'Pracovní záznamy',
    noWorkLogs: 'Zatím žádné záznamy',
    noWorkLogsDesc: 'Vaše zaznamenané směny a instalace panelů se zobrazí zde.',
    today: 'Dnes',
    yesterday: 'Včera',
    unknownInstallation: 'Neznámá instalace',
    deleteEntryConfirm: 'Opravdu chcete smazat tento pracovní záznam?',
    addLog: 'Přidat záznam',
    addEntryChoiceTitle: 'Co chcete zaznamenat?',
    addTimeEntry: 'Hodinový záznam',
    addPanelLog: 'Záznam panelů',
    panels: 'panely',
    viewDetails: 'Zobrazit detaily',

    // Work Entry Detail Modal
    workEntryDetails: 'Detail pracovního záznamu',
    notes: 'Poznámky',
    photo: 'Fotka',
    noNotes: 'K tomuto záznamu nejsou žádné poznámky.',
    noPhoto: 'Není připojena žádná fotografie.',
    duration: 'Doba trvání',
    period: 'Období',

    // Time Entry Modal
    newTimeEntry: 'Nový hodinový záznam',
    editTimeEntry: 'Upravit hodinový záznam',
    installation: 'Instalace',
    selectInstallation: 'Vyberte instalaci',
    startDate: 'Datum začátku',
    startTime: 'Čas začátku',
    endDate: 'Datum konce',
    endTime: 'Čas konce',
    endTimeAfterStart: 'Čas konce musí být po čase začátku.',
    addNote: 'Přidat poznámku (volitelné)',
    addPhoto: 'Přidat fotku',

    // Panel Log Modal
    newPanelLog: 'Nový záznam panelů',
    editPanelLog: 'Upravit záznam panelů',
    date: 'Datum',
    panelsInstalled: 'Instalovaných panelů',
    invalidPanelCount: 'Zadejte prosím platný počet panelů.',

    // Stats Screen
    statistics: 'Statistiky',
    forUser: 'pro {0}',
    totalHours: 'Celkem hodin',
    totalPanels: 'Celkem panelů',
    totalEarnings: 'Celkový výdělek',
    weeklyHours: 'Týdenní hodiny',
    allUsers: 'Všichni uživatelé',
    filterInstallation: 'Filtrovat instalaci',
    allInstallations: 'Všechny instalace',
    generateAIReport: 'Generovat AI report',
    generatingReport: 'Generuji report...',
    weeklySummary: 'Týdenní AI souhrn',
    aiReportError: 'Nepodařilo se vygenerovat AI report. Zkuste to prosím později.',
    
    // Installations Screen
    installationsTitle: 'Instalace',
    noInstallations: 'Zatím žádné instalace',
    noInstallationsDesc: 'Kliknutím na tlačítko \'+\' vytvoříte svou první stavbu.',
    addInstallation: 'Přidat novou instalaci',
    edit: 'Upravit',
    delete: 'Smazat',
    deleteInstallationConfirm: 'Opravdu chcete smazat tuto instalaci?',
    deleteInstallationWithEntriesConfirm: 'Tato instalace má {0} pracovních záznamů. Opravdu ji chcete smazat i se všemi záznamy? Tuto akci nelze vrátit.',

    // Installation Modal
    newInstallation: 'Nová instalace',
    editInstallation: 'Upravit instalaci',
    installationName: 'Název instalace (např. adresa stavby)',
    color: 'Barva',
    
    // Settings Screen
    settingsTitle: 'Nastavení',
    userProfile: 'Uživatelský profil',
    loggedInAs: 'Přihlášen jako:',
    switchUser: 'Změnit uživatele',
    rates: 'Sazby',
    hourlyWage: 'Hodinová mzda',
    ratePerPanel: 'Sazba za panel',
    currencySymbol: 'Symbol měny (např. CZK, EUR, USD)',
    language: 'Jazyk',
    dataManagement: 'Správa dat',
    exportData: 'Exportovat data',
    importData: 'Importovat data',
    dangerZone: 'Nebezpečná zóna',
    dangerZoneDesc: 'Tuto akci nelze vrátit. Trvale smažete všechny své instalace a pracovní záznamy pro aktuálního uživatele.',
    resetAllData: 'Resetovat všechna data',
    exportError: 'Chyba při exportu dat.',
    importConfirm: 'Jste si jistý? Tímto přidáte importované instalace a záznamy k datům aktuálního uživatele.',
    importSuccess: 'Data byla úspěšně importována!',
    importError: 'Chyba při importu dat. Zkontrolujte prosím formát souboru.',
    resetConfirm: 'POZOR: Opravdu chcete smazat všechny instalace a záznamy pro uživatele {0}? Tato akce je nevratná.',
    // FIX: Add missing translation key for reset success message.
    resetSuccess: 'Všechna data pro uživatele {0} byla úspěšně resetována.',
  }
};