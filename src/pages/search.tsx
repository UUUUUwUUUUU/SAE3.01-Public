import TaxonCard from '@/components/TaxonCard';
import Taxon from '@/types/Taxon';
import TaxonNaturotheque from '@/types/TaxonNaturotheque';
import TaxonRank from '@/types/TaxonRank';
import API_CLASS from '@api/api_taxref';
import LoadingSpinner from '@elements/LoadingSpinner';
import SearchNavBar from '@elements/SearchNavBar';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { IncomingMessage } from 'http';
import fetch from 'isomorphic-unfetch';
import { NextPageContext } from 'next';
import { Session, withIronSession } from 'next-iron-session';

import { IconInfoCircle } from '@icons';
import { useTheme } from '@providers/Themes';
import useTranslation from 'next-translate/useTranslation';

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

const SearchPage: React.FC<UserPageProps> = ({ user }) => {
    const router = useRouter();
    const [taxons, setTaxons] = useState<TaxonNaturotheque[]>([]);
    const [searchResults, setSearchResults] = useState<Taxon[]>([]);
    const [isGridMode, setIsGridMode] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRank, setSelectedRank] = useState<TaxonRank>(TaxonRank.ES);
    const searchQuery = router.query.q as string || '';
    const { lang, t } = useTranslation('common');
    const { theme } = useTheme();

    useEffect(() => {
        const apiInstance = new API_CLASS();
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const normalizedQuery = normalize(searchQuery); // Supprimer les accents
                const results = await apiInstance.taxon_search(normalizedQuery, lang === 'fr' ? 'french' : 'english', selectedRank);
                setSearchResults(results);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchTaxons = async () => {
            try {
                const response = await fetch(`/api/api_naturotheque?id_membre=${user.id}`);

                if (response.status === 200) {
                    const data = await response.json();
                    setTaxons(data);
                    // setLoading(false);
                } else if (response.status === 204) {
                    setTaxons([]);
                    // setNoContent(true);
                    // setLoading(false);
                }
            } catch (error) {
                console.error('An error occurred while fetching the taxons.', error);
                // setError('An error occurred while fetching the taxons.');
                // setLoading(false);
            }
        };

        if (searchQuery.trim() !== '') {
            fetchData();
            if (user) {
                fetchTaxons();
            }
        } else {
            // Si la query est vide, rediriger page d'accueil
            router.push('/');
        }
    }, [router, searchQuery, lang, selectedRank, user]);


    const handleModeSwitch = () => {
        setIsGridMode(!isGridMode);
    };

    const handleRankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRank(event.target.value as TaxonRank);
    };

    const normalize = (str: string) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    return (
        <div className="container-fluid mt-4">
            <div className="mb-4">
                <SearchNavBar
                    isGridMode={isGridMode}
                    handleModeSwitch={handleModeSwitch}
                    selectedRank={selectedRank}
                    handleRankChange={handleRankChange}
                    theme={theme}
                />
            </div>
            {isLoading ? (
                <LoadingSpinner />
            ) : searchResults.length > 0 ? (
                <div className="row row-cols-2 row-cols-md-6 g-3">
                    {searchResults.map((taxon: Taxon) => {
                        const isInNaturotheque = taxons.some(t => t.idtaxon === taxon.id);
                        return (
                            <TaxonCard
                                user={user} isInNaturotheque={isInNaturotheque}
                                taxon={taxon} isGridMode={isGridMode} key={taxon.id}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="col-12 text-center">
                    <h1 style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <IconInfoCircle />
                        &nbsp;{t('SEARCH_NO_RESULT')}</h1>
                    <p>{t('SEARCH_LANG_WARN')}</p>
                </div>
            )
            }
            <span style={{ userSelect: 'none' }}>&nbsp;</span>
        </div>
    );
};

export const getServerSideProps = withIronSession(
    async ({ req }: NextIronPageContext) => {
        const user = req.session.get('user');

        if (!user) {
            return {
                props: {},
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

export default SearchPage;
