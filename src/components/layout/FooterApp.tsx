// Importations
import React from 'react';
import { useTheme } from '@providers/Themes';

/**
 * Un footer pour l'application
 *
 * @returns {JSX.Element} - le footer
 */
const FooterApp: React.FC = () => {
  /** Permet de récupérer le thème actuel */
  const { theme } = useTheme();

  return (
    <footer className={`bg-${theme} text-${theme === 'light' ? 'dark' : 'light'} text-center p-2 border-top`} data-bs-theme={theme}>
      <div className="container">
        <p>MaNaturothèque™</p>
        {/* //TODO: Footer - rework text actuel */}
        {/* //TODO: Footer - ajouter UPEC */}
        {/* //TODO: Footer - ajouter Documentation */}
      </div>
    </footer>
  );
};

export default FooterApp;