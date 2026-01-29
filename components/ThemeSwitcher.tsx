import React, { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from './icons';

type Theme = 'light' | 'dark';

const ThemeSwitcher: React.FC = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'light';
        const storedTheme = localStorage.getItem('theme') as Theme;
        if (storedTheme) return storedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-base-200 text-text-secondary hover:text-brand-primary transition-all active:scale-90"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? (
            <MoonIcon className="w-4 h-4" />
          ) : (
            <SunIcon className="w-4 h-4" />
          )}
        </button>
    );
};

export default ThemeSwitcher;