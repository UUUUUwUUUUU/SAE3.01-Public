// Importations
import React, { ReactNode } from 'react';
import { useTheme } from '@providers/Themes';

/**
 * Propriétés du composant ContainerApp
 * @see https://fr.reactjs.org/docs/components-and-props.html
 */
interface ContainerAppProps {
  children?: ReactNode;
}

/**
 * Un container pour le contenu de l'application
 *
 * @param {ReactNode} children - le contenu du container
 * @returns {JSX.Element} - le container
 */
const ContainerApp: React.FC<ContainerAppProps> = ({ children }) => {
  const { theme } = useTheme();

  return <div className={`container-app ${theme}`}>
    {children}
  </div>;
};

export default ContainerApp;