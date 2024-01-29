import React, { useEffect, useState } from 'react';
import API_CLASS from '@/pages/api/api_taxref';
import Taxon from '@/types/Taxon';
import TaxonCard from '@/components/TaxonCard';
import TaxonNaturotheque from '@/types/TaxonNaturotheque';
import FeaturedTaxonCard from '@/components/FeaturedTaxonCard';
import LoadingSpinner from '@elements/LoadingSpinner';
import { NextPageContext } from 'next';
import { withIronSession } from 'next-iron-session';
import { Session } from 'next-iron-session';
import { IncomingMessage } from 'http';
import useTranslation from 'next-translate/useTranslation';
import fetch from 'isomorphic-unfetch';

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

const Index: React.FC<UserPageProps> = ({ user }) => {
  const [taxons, setTaxons] = useState<TaxonNaturotheque[]>([]);
  const [searchResults, setSearchResults] = useState<Taxon[]>([]);
  const [dailyTaxon, setDailyTaxon] = useState<Taxon | null>(null);
  const [randomTaxon, setRandomTaxon] = useState<Taxon | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add isLoading state
  const { t } = useTranslation('common');

  useEffect(() => {
    const apiInstance = new API_CLASS();
    const fetchData = async () => {
      try {
        const results = await apiInstance.searchAll();
        setSearchResults(results);

        // Placeholder : Sélectionner un taxon aléatoire parmi les résultats
        const date = new Date();
        const index = date.getDate() % results.length;
        setDailyTaxon(results[index]);

        // Placeholder : Sélectionner un taxon aléatoire parmi les résultats
        const randomIndex = Math.floor(Math.random() * results.length);
        setRandomTaxon(results[randomIndex]);

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
    fetchData();
    if (user) {
      fetchTaxons();
    }
  }, [user]);

  return (
    <div className='container-fluid'>
      <div className='row pt-3'>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <FeaturedTaxonCard taxon={dailyTaxon} title={t("Animal du jour")} />
            <FeaturedTaxonCard taxon={randomTaxon} title={t("Animal aléatoire")} alignRight />
            {/*TODO: Résultats search en tri alphabétique?*/}
            <div className="container text-center">
              <div className="row row-cols-2 row-cols-md-6 g-3 pt-4">
                {searchResults.map((taxon: Taxon) => {
                  const isInNaturotheque = taxons.some(taxonNaturotheque => taxonNaturotheque.idtaxon === taxon.id);
                  return (
                    <TaxonCard
                      user={user} isInNaturotheque={isInNaturotheque}
                      taxon={taxon} isGridMode={true} key={taxon.id}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
      <span style={{ userSelect: 'none' }}>&nbsp;</span>
    </div>
  );
};

export const getServerSideProps = withIronSession(
  async ({ req }: NextIronPageContext) => {
    const user = req.session.get('user');

    if (!user) {
      return {
        props: {}
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

export default Index;