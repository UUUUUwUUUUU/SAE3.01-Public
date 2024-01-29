// Importations
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

/** Définition du type Theme
 * @see https://www.typescriptlang.org/fr/docs/handbook/2/objects.html
*/
type Theme = 'light' | 'dark';

/**
 * Propriétés du composant ThemeContext
 * @see https://fr.reactjs.org/docs/components-and-props.html
 */
interface ThemeContextProps {
    theme: Theme;
    toggleTheme: () => void;
}

/**
 * Propriétés du composant LanguageProvider
 * @see https://fr.reactjs.org/docs/components-and-props.html
 */
interface ThemeProviderProps {
    children: ReactNode;
}

// Création du contexte : https://fr.reactjs.org/docs/context.html
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

/**
 * Composant ThemeProvider, permet de gérer le thème de l'application
 * @param {ReactNode} children - le contenu du container
 * @returns {JSX.Element} - le composant 
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        setTheme(storedTheme === 'dark' ? 'dark' : 'light');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};