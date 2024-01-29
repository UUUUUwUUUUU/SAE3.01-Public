import React from 'react';
import Taxon from '@/types/Taxon';
import ApiGetImage from '@/pages/api/api_getImage';
import { useTheme } from '@providers/Themes';
import Link from 'next/link';

interface FeaturedTaxonCardProps {
  taxon: Taxon | null;
  title: string;
  alignRight?: boolean;
}

const CardBody: React.FC<{ taxon: Taxon }> = ({ taxon }) => {
  return (
    <div className="col-md-8">
      <div className="card-body">
        <h5 className="card-title">{taxon.fullname}</h5>
        <p className="card-text">{taxon.vernacularName}</p>
      </div>
    </div>
  );
};

const CardImage: React.FC<{ taxon: Taxon }> = ({ taxon }) => {
  return (
    <div className="col-md-4">
      <Link href={`/details?taxon=${taxon.id}`}>
        <ApiGetImage id={taxon.id} className="card-img-top" />
      </Link>
    </div>
  );
}

const FeaturedTaxonCard: React.FC<FeaturedTaxonCardProps> = ({ taxon, title, alignRight }) => {
  const { theme } = useTheme();
  const isPhoneSize = window.innerWidth <= 768;
  const shouldAlignRight = isPhoneSize ? false : alignRight;

  return (
    <div className="col-6">
      <div className={`card h-100 text-bg-${theme} shadow border border-${theme} border-1`}>
        <div className="card-header">
          <h4 className="text-center" style={{ fontSize: 'clamp(0.9rem, 1vw, 1rem)' }}>{title}</h4>
        </div>
        <div className="row g-0" >
          {taxon ? (
            <>
              {shouldAlignRight ? (
                <>
                  {!isPhoneSize && <CardBody taxon={taxon} />}
                  <CardImage taxon={taxon} />
                </>
              ) : (
                <>
                  <CardImage taxon={taxon} />
                  {!isPhoneSize && <CardBody taxon={taxon} />}
                </>
              )}
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedTaxonCard;