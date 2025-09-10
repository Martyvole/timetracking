
export interface User {
  id: string;
  name: string;
  isAdmin?: boolean;
}

export interface Installation {
  id:string;
  name: string;
  color: string;
  userId: string;
}

export interface Task {
  id: string;
  installationId: string;
  userId: string;
  name: string;
}

// Base interface for all work entries
interface BaseEntry {
  id: string;
  installationId: string;
  userId: string;
  taskId?: string;
  notes?: string;
  photo?: string; // base64 encoded string
}

// Entry for timed (hourly) work
export interface TimeEntry extends BaseEntry {
  type: 'hourly';
  startTime: number;
  endTime: number | null;
  duration: number; // in seconds
}

// Entry for piece-rate (panel) work
export interface PanelEntry extends BaseEntry {
    type: 'panels';
    date: number; // Timestamp for the day work was done
    count: number; // Number of panels installed
}

export type WorkEntry = TimeEntry | PanelEntry;

export type Screen = 'timer' | 'stats' | 'installations' | 'settings' | 'history';

export interface HapticFeedbackType {
  light: number[];
  medium: number[];
  success: number[];
  error: number[];
}