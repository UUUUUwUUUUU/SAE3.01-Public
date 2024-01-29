import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';

const VerifyPage = () => {
    const router = useRouter();
    const { token } = router.query;
    const [message, setMessage] = useState('');
    const { t } = useTranslation('common');

    useEffect(() => {
        if (!token) {
            return;
        }

        // Appel API vérification email
        fetch(`/api/verify?token=${token}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setMessage(data.error);
                } else {
                    setMessage(t('SUCCESSFUL_EMAIL_VERIFICATION'));
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                setMessage(t('FAILED_EMAIL_VERIFICATION'));
            });
    }, [t, token]);

    const handleReturnHome = () => {
        router.push('/'); // Replace '/' with the actual home page URL
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-center align-items-center">
                <div className="text-center">
                    <h1>{t('EMAIL_VERIFICATION')}</h1>
                    <div className="mt-3">
                        <span>{message}</span>
                    </div>
                    <button
                        className="btn btn-primary mt-3"
                        onClick={handleReturnHome}
                    >
                        {t('RETURN_TO_HOME')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyPage;