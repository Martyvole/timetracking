import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { HapticFeedbackType } from './types';
import { translations } from './localization';

// --- Local Storage Hook ---
export function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}


// --- Haptic Feedback Hook ---
const HAPTIC_PATTERNS: HapticFeedbackType = {
  light: [10],
  medium: [40],
  success: [10, 50, 10, 50],
  error: [50, 20, 50, 20, 50],
};

export const useHapticFeedback = () => {
    const trigger = useCallback((type: keyof HapticFeedbackType) => {
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(HAPTIC_PATTERNS[type]);
        }
    }, []);
    return trigger;
};

// --- Translation Hook ---
export const useTranslation = () => {
    const [language, setLanguage] = useLocalStorage<'en' | 'cs'>('flowtime_language', 'cs');

    const t = useCallback((key: keyof typeof translations.en, ...args: (string | number)[]) => {
        let translation = translations[language][key] || translations.en[key] || key;
        if (args.length > 0) {
            args.forEach((arg, index) => {
                translation = translation.replace(`{${index}}`, String(arg));
            });
        }
        return translation;
    }, [language]);

    return { t, setLanguage, language };
};