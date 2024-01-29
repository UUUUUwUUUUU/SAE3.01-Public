import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { IconCheckSquare, IconSquare } from '@icons';
import ModalPopup from '@elements/ModalPopup';
import { useTheme } from '@providers/Themes';
import useTranslation from 'next-translate/useTranslation';
import fetch from 'isomorphic-unfetch';

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { t } = useTranslation('common');
    const { theme } = useTheme();

    // Sécurité mdp
    const [hasUpperCase, setHasUpperCase] = useState(false);
    const [hasLowerCase, setHasLowerCase] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasSpecialChar, setHasSpecialChar] = useState(false);
    const [hasMinLength, setHasMinLength] = useState(false);

    // Pop-up
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState('');
    const [popupMessage, setPopupMessage] = useState('');

    const handlePasswordChange = (e: { target: { value: any; }; }) => {
        const password = e.target.value;
        setPassword(password);

        // Vérifier critères de sécurité
        setHasUpperCase(/[A-Z]/.test(password));
        setHasLowerCase(/[a-z]/.test(password));
        setHasNumber(/[0-9]/.test(password));
        setHasSpecialChar(/[\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\\\|\,\.\?\/\`\~\:]/.test(password));
        setHasMinLength(password.length >= 8);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const urlSearchParams = new URLSearchParams(window.location.search);
        const token = urlSearchParams.get('token');

        if (!token) {
            setError('Reset token is missing from URL');
            return;
        }

        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar || !hasMinLength) {
            setError('Password does not meet the security requirements');
            return;
        }

        try {
            const response = await fetch('/api/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password,
                }),
            });

            if (response.ok) {
                setPopupTitle('Success');
                setPopupMessage('You have successfully reset your password.');
                setShowPopup(true);
            } else {
                const result = await response.json();
                setError(result.error);
            }
        } catch (error: any) {
            setError(error.message || 'Failed to reset password');
        }
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        router.push('/');
    };

    useEffect(() => {
        // Si le token est manquant, rediriger page d'accueil
        const urlSearchParams = new URLSearchParams(window.location.search);
        const token = urlSearchParams.get('token');

        if (!token) {
            router.push('/');
        }
    }, [router]);

    return (
        <div className="container-fluid mt-4">
            {showPopup && (
                <ModalPopup title={popupTitle} description={popupMessage} onClose={handleClosePopup} theme={theme} />
            )}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <form onSubmit={handleSubmit}>
                    <div>
                        <h1>{t('RESET_PASSWORD')}</h1>
                        <div className="form-group">
                            <input
                                type="password"
                                className="form-control"
                                placeholder={t('NEW_PASSWORD')}
                                value={password}
                                onChange={handlePasswordChange}
                            />
                        </div>
                    </div>
                    <div className='mt-4' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        <div className="password-criteria">
                            <div className={hasUpperCase ? 'valid' : 'invalid'}>
                                {hasUpperCase ? <IconCheckSquare /> : <IconSquare />}
                                &nbsp;Has an uppercase letter
                            </div>
                            <div className={hasLowerCase ? 'valid' : 'invalid'}>
                                {hasLowerCase ? <IconCheckSquare /> : <IconSquare />}
                                &nbsp;Has a lowercase letter
                            </div>
                            <div className={hasNumber ? 'valid' : 'invalid'}>
                                {hasNumber ? <IconCheckSquare /> : <IconSquare />}
                                &nbsp;Has a number
                            </div>
                            <div className={hasSpecialChar ? 'valid' : 'invalid'}>
                                {hasSpecialChar ? <IconCheckSquare /> : <IconSquare />}
                                &nbsp;Has a special character
                            </div>
                            <div className={hasMinLength ? 'valid' : 'invalid'}>
                                {hasMinLength ? <IconCheckSquare /> : <IconSquare />}
                                &nbsp;Has at least 8 characters
                            </div>
                        </div>
                    </div>
                    <div className='mt-4'>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <button type="submit" className="btn btn-primary">{t('RESET_PASSWORD')}</button>
                    </div>
                </form >
            </div >
        </div >
    );
};

export default ResetPassword;