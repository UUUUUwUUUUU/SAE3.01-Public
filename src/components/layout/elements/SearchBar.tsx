import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { IconSearchOutline } from '@icons';
import useTranslation from 'next-translate/useTranslation';

const SearchBar: React.FC = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation('common');
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 300);
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (searchQuery.trim() === '') {
            return;
        }
        const searchUrl = `/search?q=${encodeURIComponent(searchQuery)}`;
        router.push(searchUrl);
    };

    return (
        <form onSubmit={handleSearch} className={`d-flex p-2 justify-content-between w-50 ${isSmallScreen ? 'search-phone' : 'mx-auto'}`}>
            <input
                className="form-control me-2"
                type="search"
                placeholder={t('title')}
                aria-label="Search"
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {!isSmallScreen && (
                <button className="btn btn-outline-success" type="submit" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 'auto',
                }}>
                    <IconSearchOutline />
                </button>
            )}
        </form>
    );
};

export default SearchBar;