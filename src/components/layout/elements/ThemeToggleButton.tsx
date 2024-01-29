import { useScreenSize } from '@elements/Listener';
import { IconMoon, IconSun } from '@icons';
import { useTheme } from '@providers/Themes';
import React from 'react';

const ThemeToggleButton: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const isPhoneSize = useScreenSize(460);

    if (isPhoneSize) {
        return null;
    }

    const buttonClass = theme === 'light' ? 'btn-outline-dark' : 'btn-outline-light';
    const Icon = theme === 'light' ? (
        <IconMoon />
    ) : (
        <IconSun />
    );

    return (
        <button
            className={`btn ${buttonClass}`}
            onClick={toggleTheme}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {Icon}
        </button>
    );
};

export default ThemeToggleButton;