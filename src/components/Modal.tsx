import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@providers/Themes';
import Link from 'next/link';
import { IconArrowLeftThick, IconSquare, IconCheckSquare, IconEye, IconEyeOff } from '@icons';
import ModalPopup from '@elements/ModalPopup';
import LoadingSpinner from '@elements/LoadingSpinner';
import useTranslation from 'next-translate/useTranslation';
import fetch from 'isomorphic-unfetch';
interface LoginWindowProps {
    onClose: () => void;
}

enum AuthMode {
    Login,
    Register,
    ForgotPassword,
}

const Modal: React.FC<LoginWindowProps> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [authMode, setAuthMode] = useState(AuthMode.Login);
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [passwordType, setPasswordType] = useState('password');
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();
    const { t } = useTranslation('common');

    // Mot de passe sécurisé
    const [hasUpperCase, setHasUpperCase] = useState(false);
    const [hasLowerCase, setHasLowerCase] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasSpecialChar, setHasSpecialChar] = useState(false);
    const [hasMinLength, setHasMinLength] = useState(false);

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (authMode === AuthMode.Login || authMode === AuthMode.Register) {
            if (email.trim() === '' || password.trim() === '') {
                setError(t('Veuillez remplir tous les champs'));
                setLoading(false);
                return;
            }
        } else if (authMode === AuthMode.ForgotPassword) {
            if (email.trim() === '') {
                setError(t('Veuillez remplir tous les champs'));
                setLoading(false);
                return;
            }
        }

        if (authMode === AuthMode.Register) {
            if (password !== confirmPassword) {
                setError(t('Les mots de passe ne correspondent pas'));
                setLoading(false);
                return;
            }

            // Vérifier les critères de sécurité
            if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar || !hasMinLength) {
                setError(t('Le mot de passe ne répond pas aux exigences de sécurité'));
                setLoading(false);
                return;
            }
        }

        if (authMode === AuthMode.ForgotPassword) {
            handleForgotPassword(e);
        } else {
            try {
                const url = authMode === AuthMode.Login ? '/api/login' : '/api/register';
                const storedLanguage = localStorage.getItem('language') || 'fr';
                const body = authMode === AuthMode.Login
                    ? {
                        userpassword: password,
                        email,
                    }
                    : {
                        userpassword: password,
                        email,
                        language: storedLanguage,
                    };
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });

                setLoading(false);

                if (response.ok) {
                    const result = await response.json();

                    if (result.error) {
                        setError(result.error);
                    } else {
                        handleShowPopup(authMode);
                    }
                } else if (response.status === 500) {
                    setError(t('Unable to reach server, server may be offline'));
                } else {
                    const err = await response.json();
                    setError(err.message);
                }

            } catch (error: any) {
                setError(t('Une erreur est survenue'));
            }
        }

        if (emailRef.current) {
            emailRef.current.value = '';
        }
        if (passwordRef.current) {
            passwordRef.current.value = '';
        }

    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        setPassword(password);

        // Vérifier les critères de sécurité
        setHasUpperCase(/[A-Z]/.test(password));
        setHasLowerCase(/[a-z]/.test(password));
        setHasNumber(/[0-9]/.test(password));
        setHasSpecialChar(/[\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\\\|\,\.\?\/\`\~\:]/.test(password));
        setHasMinLength(password.length >= 8);
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const storedLanguage = localStorage.getItem('language');
            const response = await fetch('/api/forgotten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    language: storedLanguage || 'en',
                }),
            });

            if (response.ok) {
                const result = await response.json();

                if (result.error) {
                    setError(result.error);
                } else {
                    setPopupTitle(t('Success'));
                    setPopupMessage(t('Password reset email sent successfully. Please check your email.'));
                    setShowPopup(true);
                    setAuthMode(AuthMode.Login);
                    setError(''); // Réinitialiser le message d'erreur (si il y en a un)
                }
            } else if (response.status === 500) {
                setError(t('Unable to reach server, server may be offline'));
            } else {
                const err = await response.json();
                setError(err.message);
            }
        } catch (error: any) {
            setError(t('Failed to send password reset email'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscapeKey);

        return () => {
            window.removeEventListener('keydown', handleEscapeKey);
        };
    }, [onClose]);

    const handleSwitchAuthMode = () => {
        setAuthMode(authMode === AuthMode.Login ? AuthMode.Register : AuthMode.Login);
        setError(''); // Réinitialiser le message d'erreur (si il y en a un)
    };

    const handleShowPopup = (authMode: AuthMode.Register | AuthMode.Login | AuthMode.ForgotPassword) => {
        if (authMode === AuthMode.Login) {
            setPopupTitle(t('Success'));
            setPopupMessage(t('You have successfully logged in.'));
        } else if (authMode === AuthMode.Register) {
            setPopupTitle(t('Success'));
            setPopupMessage(t('You have successfully registered. Please check your email to activate your account.'));
        } else if (authMode === AuthMode.ForgotPassword) {
            setPopupTitle(t('Success'));
            setPopupMessage(t('Password reset email sent successfully. Please check your email.'));
        }

        setShowPopup(true);
        setError(''); // Réinitialiser le message d'erreur (si il y en a un)
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        onClose(); // Close the modal after the pop-up is closed
    };

    const handleReturn = () => {
        setAuthMode(AuthMode.Login);
        setError(''); // Réinitialiser le message d'erreur (si il y en a un)
    };

    return (
        <div className="modal-overlay">
            <div className={"modal"}>
                <button type="button" className="modal-close btn-close" aria-label="Close" onClick={onClose} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}></button>

                {loading ? (
                    <LoadingSpinner shouldBeOverlay />
                ) : (
                    authMode === AuthMode.ForgotPassword && (
                        <button className="modal-close btn-close" onClick={handleReturn} aria-label="Return" style={{
                            right: 'revert',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'none',
                            width: '1.2em',
                            height: '1.2em',
                        }}>
                            <IconArrowLeftThick />
                        </button>
                    )
                )}
                <div className="modal-header">
                    <h5 className={`modal-title ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                        {authMode === AuthMode.Login ? t('Connexion') : authMode === AuthMode.Register ? t('Inscription') : t('Forgot Password')}
                    </h5>
                </div>
                <div className="modal-body" style={{ flex: 'none' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                aria-describedby="emailHelp"
                                placeholder="E-mail *"
                                value={email}
                                ref={emailRef}
                                autoComplete="email"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {authMode !== AuthMode.ForgotPassword && (
                            <>
                                <div className="mb-3">
                                    <div className="input-group mx-auto" style={{ width: '70%' }}>
                                        <input
                                            type={passwordType}
                                            className="form-control"
                                            id="password"
                                            placeholder={t("Mot de passe *")}
                                            value={password}
                                            ref={passwordRef}
                                            autoComplete="new-password"
                                            onChange={handlePasswordChange}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setPasswordType(passwordType === 'password' ? 'text' : 'password')}
                                        >
                                            {passwordType === 'password' ? <IconEye /> : <IconEyeOff />}
                                        </button>
                                    </div>
                                </div>
                                {authMode === AuthMode.Register && (
                                    <div className="mb-3">
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="confirmPassword"
                                            placeholder={t("Confirmer le mot de passe *")}
                                            value={confirmPassword}
                                            autoComplete="new-password"
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                )}
                                {authMode !== AuthMode.Login && (
                                    <div className='mb-3' style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <div className="password-criteria">
                                            <div className={hasUpperCase ? 'valid' : 'invalid'}>
                                                {hasUpperCase ? <IconCheckSquare /> : <IconSquare />}
                                                &nbsp;{t("Has an uppercase letter")}
                                            </div>
                                            <div className={hasLowerCase ? 'valid' : 'invalid'}>
                                                {hasLowerCase ? <IconCheckSquare /> : <IconSquare />}
                                                &nbsp;{t("Has a lowercase letter")}
                                            </div>
                                            <div className={hasNumber ? 'valid' : 'invalid'}>
                                                {hasNumber ? <IconCheckSquare /> : <IconSquare />}
                                                &nbsp;{t("Has a number")}
                                            </div>
                                            <div className={hasSpecialChar ? 'valid' : 'invalid'}>
                                                {hasSpecialChar ? <IconCheckSquare /> : <IconSquare />}
                                                &nbsp;{t("Has a special character")}
                                            </div>
                                            <div className={hasMinLength ? 'valid' : 'invalid'}>
                                                {hasMinLength ? <IconCheckSquare /> : <IconSquare />}
                                                &nbsp;{t("Has at least 8 characters")}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        {error && <div className="alert alert-danger mx-auto" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '70%',
                        }}>{error}</div>}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button type="submit" className="btn btn-primary" style={{ position: 'relative', left: '0' }}>
                                {authMode === AuthMode.Login ? t('Log in') : authMode === AuthMode.Register ? t('Register') : t('Send password reset email')}
                            </button>
                        </div>
                    </form>
                </div>
                <div className="modal-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'space-between' }}>
                    {authMode !== AuthMode.ForgotPassword && (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                                <p className="text-muted" style={{ lineHeight: '1.5', marginBottom: '0' }}>
                                    {authMode === AuthMode.Login ? t("Don't have an account?") : t('Already have an account?')}
                                </p>
                                <Link href="" onClick={handleSwitchAuthMode} style={{ lineHeight: '1.5', marginBottom: '0', marginLeft: '0.3vw' }}>
                                    {authMode === AuthMode.Login ? t('Sign Up') : t('Log in')}
                                </Link>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                                <p className="text-muted" style={{ lineHeight: '1.5', marginBottom: '0', }}>
                                    {t("Forgot your")}
                                </p>
                                <Link href="" onClick={() => setAuthMode(AuthMode.ForgotPassword)} style={{ marginLeft: '0.3vw' }}>
                                    {t("password")}
                                </Link>
                                ?
                            </div>
                        </>
                    )}
                </div>
            </div>
            {showPopup && (
                <ModalPopup title={popupTitle} description={popupMessage} onClose={handleClosePopup} theme={theme} />
            )}
        </div>
    );
};

export default Modal;
