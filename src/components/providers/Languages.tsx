// Importations
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

/** Définition du type Language
 * @see https://www.typescriptlang.org/fr/docs/handbook/2/objects.html
*/
type Language = 'fr' | 'en';

/**
 * Propriétés du composant LanguageContext
 * @see https://fr.reactjs.org/docs/components-and-props.html
 */
interface LanguageContextProps {
    language: Language;
    setLanguage: (language: Language) => void;
}

/**
 * Propriétés du composant LanguageProvider
 * @see https://fr.reactjs.org/docs/components-and-props.html
 */
interface LanguageProviderProps {
    children: ReactNode;
}

// Création du contexte : https://fr.reactjs.org/docs/context.html
const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

/**
 * Composant LanguageProvider, permet de gérer la langue de l'application
 * @param {ReactNode} children - le contenu du container
 * @returns {JSX.Element} - le composant 
 */
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('fr');

    useEffect(() => {
        const storedLanguage = localStorage.getItem('language');
        setLanguage(storedLanguage === 'en' ? 'en' : 'fr');
    }, []);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Fonction qui sera utilisée dans les composants pour récupérer la langue de l'application
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage doit être utilisé dans <LanguageProvider>');
    }
    return context;
};
