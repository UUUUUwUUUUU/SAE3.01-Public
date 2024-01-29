import React, { useEffect, useState } from 'react';
import { IconSettingsOutline, IconMoon, IconSun } from '@icons';
import { useTheme } from '@providers/Themes';
import setLanguage from 'next-translate/setLanguage'

const SettingsButton: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [isPhoneSize, setIsPhoneSize] = useState(false);

    const handleLanguageChange = (language: string) => {
        localStorage.setItem('language', language);
        setLanguage(language);
    }

    const handleCloseDropdown = (event: React.MouseEvent) => {
        const dropdown = (event.target as HTMLElement).closest('.dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }
        }
    }

    useEffect(() => {
        const storedLanguage = localStorage.getItem('language');
        setLanguage(storedLanguage === 'en' ? 'en' : 'fr');

        const handleResize = () => {
            setIsPhoneSize(window.innerWidth <= 460);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const buttonClass = theme === 'light' ? 'btn-outline-dark' : 'btn-outline-light';

    return (
        <div className="dropdown">
            <button className={`btn ${buttonClass} dropdown-toggle`} type="button" id="settingsDropdown" data-bs-toggle="dropdown" aria-expanded="false"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <IconSettingsOutline />
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="settingsDropdown">
                {isPhoneSize &&
                    <li>
                        <button className="dropdown-item" onClick={(event) => {
                            toggleTheme();
                            handleCloseDropdown(event);
                        }}>
                            {theme === 'light' ?
                                <IconMoon /> : <IconSun />
                            }
                            Toggle Theme
                        </button>
                    </li>}
                <li>
                    <button className="dropdown-item" onClick={(event) => {
                        handleLanguageChange('fr'); handleCloseDropdown(event);
                    }}>Français
                    </button>
                </li>
                <li>
                    <button className="dropdown-item" onClick={(event) => {
                        handleLanguageChange('en'); handleCloseDropdown(event);
                    }}>English
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default SettingsButton;

