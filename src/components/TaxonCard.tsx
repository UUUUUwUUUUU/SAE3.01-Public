import React, { useEffect, useState } from 'react';
import Taxon from '@/types/Taxon';
import ApiGetImage from '@api/api_getImage';
import { useTheme } from '@providers/Themes';
import { IconBookmarkPlusFill, IconBookmarkCheckFill } from '@icons';
import TaxonOperation from '@/types/TaxonOperation';
import Link from 'next/link';

interface TaxonCardProps {
    user?: {
        id: number;
        email: string;
    };
    isInNaturotheque?: boolean;
    taxon: Taxon;
    isGridMode: boolean;
    onTaxonChange?: () => void;
}

const TaxonCard: React.FC<TaxonCardProps> = ({ user, isInNaturotheque, taxon, isGridMode, onTaxonChange }) => {
    const [isInNaturothequeState, setIsInNaturothequeState] = useState<boolean>(isInNaturotheque || false);
    const { theme } = useTheme();

    useEffect(() => {
    }, [user]);

    const handleSavingTaxon = async (event: React.MouseEvent<HTMLButtonElement>, idtaxon: number) => {
        event.preventDefault(); // Permet de clicker sur le bouton sans être redirigé vers la page du taxon

        if (user) {
            const response = await fetch('/api/handleTaxon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    operation: isInNaturothequeState ? TaxonOperation.DELETE : TaxonOperation.ADD,
                    id_membre: user.id,
                    idtaxon: idtaxon,
                }),
            });

            if (response.ok) {
                setIsInNaturothequeState(!isInNaturothequeState)

                if (onTaxonChange) {
                    onTaxonChange();
                }
            }
        }
    };

    const CardFooter = (taxon: Taxon) => {
        return (
            taxon.vernacularName ? (
                <div className="card-body">
                    <h5 className="card-title" style={{ fontSize: Math.max(11, 0.9 * 0.01 * window.innerWidth), textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {taxon.vernacularName}
                    </h5>
                    <h6 className="card-title" style={{ fontSize: Math.max(10, 0.725 * 0.01 * window.innerWidth), textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {taxon.fullname}
                    </h6>
                </div>
            ) : (
                <div className="card-body">
                    <h5 className="card-title" style={{ fontSize: Math.max(13, 0.9 * 0.01 * window.innerWidth), textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {taxon.fullname}
                    </h5>
                </div>
            )
        );
    }

    return (
        <div className="col">
            <div className={`card h-100 text-bg-${theme} shadow border border-${theme} border-1`}>
                {isGridMode ? (
                    <Link href={`/details?taxon=${taxon.id}`} passHref target={String(taxon.id)} style={{ textDecoration: 'none', color: 'var(--bs-card-title-color)' }}>
                        <div style={{ position: 'relative' }}>
                            <ApiGetImage id={taxon.id} className="card-img-top" />
                            {user && isInNaturotheque !== undefined ? (
                                <div style={{ position: 'absolute', top: '0', right: '0', padding: '5px' }}>
                                    {isInNaturothequeState ? (
                                        <button type="button" className="btn btn-danger" onClick={(event) => handleSavingTaxon(event, taxon.id)} style={{
                                            fontSize: '1rem',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <IconBookmarkCheckFill />
                                        </button>
                                    ) : (
                                        <button type="button" className="btn btn-primary" onClick={(event) => handleSavingTaxon(event, taxon.id)} style={{
                                            fontSize: '1rem',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <IconBookmarkPlusFill />
                                        </button>
                                    )}
                                </div>

                            ) : null}
                        </div>
                        {CardFooter(taxon)}
                    </Link>

                ) : (
                    <>
                        {user && isInNaturotheque !== undefined ? (
                            <>
                                <Link href={`/details?taxon=${taxon.id}`} passHref target={String(taxon.id)} style={{ textDecoration: 'none', color: 'var(--bs-card-title-color)' }}>
                                    {CardFooter(taxon)}
                                </Link>
                                <div className="card-footer" style={{
                                    position: 'absolute',
                                    backgroundColor: isInNaturothequeState ? 'var(--bs-danger)' : 'var(--bs-primary)',
                                    bottom: '0', right: '0',
                                    width: '100%', height: '1%',
                                    padding: '0px',
                                }}>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href={`/details?taxon=${taxon.id}`} passHref target={String(taxon.id)} style={{ textDecoration: 'none', color: 'var(--bs-card-title-color)' }}>
                                    {CardFooter(taxon)}
                                </Link>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default TaxonCard;
