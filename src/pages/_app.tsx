// Importations
import { AppProps } from 'next/app';
import { useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import NavbarApp from '@layout/NavbarApp';
import ContainerApp from '@layout/ContainerApp';
import FooterApp from '@layout/FooterApp';

import { ThemeProvider } from '@providers/Themes';
import { LanguageProvider } from '@providers/Languages';

import '@/styles/global.css'

/**
 * Composant App, le composant racine de l'application
 * Définit la structure partagée par toutes les pages
 * 
 * @param {React.FC<AppProps>} Component - Page à afficher
 * @param {any} pageProps - Propriétés de la page
 * @returns {JSX.Element} - La page
 */
const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    const renewSession = async () => {
      try {
        await axios.post('/api/renew-session');
      } catch (error) {
        console.error('Failed to renew session', error);
      }
    };

    renewSession();
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Head>
          <link rel="shortcut icon" href="/images/favicon.ico" />
          <meta
            charSet="utf-8"
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <title>MaNaturothèque</title>
          <meta
            name="description"
            content="Immerse yourself in a stunning collection of taxons and save them in your personal library."
            lang="fr"
          />
          <meta
            name="description"
            content="Découvrez une collection surprenante de taxons dans notre galerie et sauvegardez-les dans votre bibliothèque personnelle."
            lang="en"
          />
        </Head>
        <ContainerApp>
          <NavbarApp />
          <Component {...pageProps} />
          <FooterApp />
        </ContainerApp>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;