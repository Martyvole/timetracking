
export interface User {
  id: string;
  name: string;
  isAdmin?: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  userId: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  startTime: number;
  endTime: number | null;
  duration: number; // in seconds
  userId: string;
}

export type Screen = 'timer' | 'stats' | 'projects' | 'settings' | 'history';

export interface HapticFeedbackType {
  light: number[];
  medium: number[];
  success: number[];
  error: number[];
}
