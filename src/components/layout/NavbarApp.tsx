import React from 'react';
import AccountButton from '@elements/AccountButton';
import HomeButton from '@elements/HomeButton';
import SearchBar from '@elements/SearchBar';
import SettingsButton from '@elements/SettingsButton';
import ThemeToggle from '@elements/ThemeToggleButton';
import { useScreenSize } from '@elements/Listener';
import { useTheme } from '@providers/Themes';

const NavbarApp: React.FC = () => {
  const { theme } = useTheme();
  const isSmallScreen = useScreenSize(300);

  return (
    <nav className={`navbar navbar-expand-lg bg-${theme} border-bottom border-body navbar px-0`} data-bs-theme={theme}>
      <div className={`container-fluid ${isSmallScreen ? 'navbar-phone' : ''}`}>
        <HomeButton />
        <SearchBar />
        <div className="d-flex gap-1">
          <ThemeToggle />
          <AccountButton />
          <SettingsButton />
        </div>
      </div>
    </nav>
  );
};

export default NavbarApp;