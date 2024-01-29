import TaxonCard from '@/components/TaxonCard';
import Taxon from '@/types/Taxon';
import TaxonNaturotheque from '@/types/TaxonNaturotheque';
import TaxonRank, { getDisplayName } from '@/types/TaxonRank';
import API_CLASS from '@api/api_taxref';
import LoadingSpinner from '@elements/LoadingSpinner';
import SearchNavBar from '@elements/SearchNavBar';
import { useTheme } from '@providers/Themes';
import { IncomingMessage } from 'http';
import fetch from 'isomorphic-unfetch';
import { NextPageContext } from 'next';
import { Session, withIronSession } from 'next-iron-session';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { IconInfoCircle } from '@icons'

interface UserPageProps {
    user: {
        id: number;
        email: string;
    };
}

interface NextIronPageContext extends NextPageContext {
    req: IncomingMessage & {
        session: Session;
    };
}

const UserPage: React.FC<UserPageProps> = ({ user }) => {
    const [taxons, setTaxons] = useState<TaxonNaturotheque[]>([]);
    const [taxonDetails, setTaxonDetails] = useState<Taxon[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [noContent, setNoContent] = useState<boolean>(false);
    const { theme } = useTheme();
    const { t } = useTranslation('common');
    const router = useRouter();

    const [isGridMode, setIsGridMode] = useState(true);
    const [selectedRank, setSelectedRank] = useState<TaxonRank>(TaxonRank.TOUT);

    const fetchTaxons = useCallback(async () => {
        try {
            const response = await fetch(`/api/api_naturotheque?id_membre=${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setTaxons(data);

                const apiInstance = new API_CLASS();
                const taxonPromises = data.map(async (taxon: TaxonNaturotheque) => {
                    try {
                        const details = await Promise.race([
                            apiInstance.taxon_details(taxon.idtaxon.toString(), 'french', true),
                            new Promise((_, reject) => setTimeout(reject, 5000))
                        ]);
                        return details;
                    } catch (error) {
                        console.error('Error:', error);
                        return null;
                    }
                });
                setLoading(true);
                const taxonDetails = await Promise.all(taxonPromises);
                const validDetails = taxonDetails
                    .filter(detail => detail !== null)
                    .filter(taxon => taxon !== null && (selectedRank === TaxonRank.TOUT || taxon.rankName === getDisplayName(selectedRank)))
                    ;
                if (taxonDetails.length === 0) {
                    setLoading(false);
                } else {
                    setTaxonDetails(validDetails);
                }
                setLoading(false);
            } else if (response.status === 204) {
                setTaxons([]);
                setTaxonDetails([]);
                setNoContent(true);
                setLoading(false);
            } else if (response.status === undefined) {
                router.push('/');
            }
        } catch (error) {
            console.error('An error occurred while fetching the taxons.', error);
            setError('An error occurred while fetching the taxons.');
            setLoading(false);
            setNoContent(true);
        }
    }, [router, selectedRank, user.id]);

    useEffect(() => {
        fetchTaxons();
    }, [fetchTaxons, selectedRank]);

    const handleTaxonChange = () => {
        fetchTaxons();
    };

    const handleModeSwitch = () => {
        setIsGridMode(!isGridMode);
    };

    const handleRankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRank(event.target.value as TaxonRank);
    };

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        router.push('/');
    };

    return (
        <div className="container-fluid mt-4">
            <div>
                <button className='btn btn-primary' onClick={handleLogout}>{t("LOGOUT")}</button>
            </div>
            <h1 className='mt-4'>{t("YOUR_LIBRARY")}</h1>
            <div className="mb-4">
                <SearchNavBar
                    isGridMode={isGridMode}
                    handleModeSwitch={handleModeSwitch}
                    selectedRank={selectedRank}
                    handleRankChange={handleRankChange}
                    theme={theme}
                    CanSelectAll />
            </div>
            <div>
                {loading && !noContent ? (
                    <LoadingSpinner />
                ) : noContent ? (
                    <div className="alert alert-info" role="alert">
                        {t("EMPTY_LIBRARY")}
                    </div>
                ) : error ? (
                    <div>Error: {error}</div>
                ) : (
                    <>
                        <div className="row row-cols-2 row-cols-md-6 g-3 pt-4">
                            {taxonDetails.length > 0 ? (
                                taxonDetails.map((taxonDetails) => {
                                    const isInNaturotheque = taxons.some(taxon => taxon.idtaxon === taxonDetails.id);
                                    return (
                                        <TaxonCard
                                            user={user} isInNaturotheque={isInNaturotheque} onTaxonChange={handleTaxonChange}
                                            taxon={taxonDetails} isGridMode={isGridMode}
                                            key={taxonDetails.id} />
                                    );
                                })
                            ) : (
                                <div className="col-12 text-center" style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    margin: 'auto'
                                }}>
                                    <div className="col-12 text-center">
                                        <h1 style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <IconInfoCircle />
                                            &nbsp;{t('EMPTY_LIBRARY')}</h1>
                                        <p>{t('ADD_CONTENT_TO_LIBRARY')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <span style={{ userSelect: 'none' }}>&nbsp;</span>
        </div >
    );
}

export const getServerSideProps = withIronSession(
    async ({ req }: NextIronPageContext) => {
        const user = req.session.get('user');

        if (!user) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            };
        }

        return {
            props: { user },
        };
    },
    {
        password: process.env.SECRET_COOKIE_PASSWORD || '',
        cookieName: 'NaturothequeSession',
        cookieOptions: {
            secure: process.env.NODE_ENV === 'production',
        },
    }
);

export default UserPage;