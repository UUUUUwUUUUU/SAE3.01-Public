import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { IconBxUser } from '@icons';
import { useTheme } from '@providers/Themes';
import LoginWindow from '@components/Modal';

const AccountButton: React.FC = () => {
    const router = useRouter();
    const { theme } = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleModalToggle = async () => {
        const response = await fetch('/api/check-session');
        const data = await response.json();

        if (data.loggedIn) {
            router.push('/user');
            setIsModalOpen(false);
        } else {
            setIsModalOpen(!isModalOpen);
        }
    };

    return (
        <>
            <button className={`btn ${theme === 'light' ? 'btn-outline-dark' : 'btn-outline-light'}`} onClick={handleModalToggle} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {/* <FiUser size={20} /> */}
                <IconBxUser />
            </button>
            {isModalOpen && <LoginWindow onClose={handleModalToggle} />}
        </>
    );
};

export default AccountButton;