import { IncomingMessage } from 'http';
import fetch from 'isomorphic-unfetch';
import { NextPageContext } from 'next';
import { Session, withIronSession } from 'next-iron-session';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { IconBookmarkPlusFill, IconBookmarkCheckFill } from '@icons';

import ApiGetImage from '@api/api_getImage';
import API_CLASS from '@api/api_taxref';
import LoadingSpinner from '@elements/LoadingSpinner';
import { useTheme } from '@providers/Themes';

import Bibliography from '@/types/Bibliography';
import Status from '@/types/Status';
import Taxon from '@/types/Taxon';
import TaxonOperation from '@/types/TaxonOperation';
import TypeHabitat from '@/types/TypeHabitat';

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

const Details: React.FC<UserPageProps> = ({ user }) => {
    // Récupération des informations de l'utilisateur, du taxon & du navigateur
    const router = useRouter();
    const taxon = router.query.taxon as string;
    const { lang, t } = useTranslation('common');
    const { theme } = useTheme();

    // Récupération des données
    const [results, setDetails] = useState<Taxon>();
    const [classifications, setClassifications] = useState<Taxon[]>([]);
    const [statuts, setStatuts] = useState<Record<string, Status[]>>({});
    const [habitat, setHabitat] = useState<TypeHabitat>();
    const [bibliographie, setBibliographie] = useState<Bibliography[]>([]);
    const [externalIds, setExternalIds] = useState<[]>([]);

    // Chargent & erreurs
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>(''); // Add error state

    // Naturothèque
    const [isInNaturotheque, setIsInNaturotheque] = useState<boolean>(false);

    useEffect(() => {
        let startUE = new Date().getTime();

        const apiInstance = new API_CLASS();
        const fetchData = async () => {
            try {
                if (taxon) {

                    // Détails du taxon
                    let start = new Date().getTime();
                    const details = await apiInstance.taxon_details(taxon, lang === 'fr' ? 'french' : 'english');
                    let elapsed = new Date().getTime() - start;
                    console.log(`taxon_details(): ${elapsed / 60000}m${elapsed / 1000}s${elapsed}ms`);

                    // Habitat
                    let habitat;
                    start = new Date().getTime();
                    if (details.habitat !== null) {
                        habitat = await apiInstance.habitat_details(details.habitat);
                    } else {
                        habitat = undefined;
                    }
                    elapsed = new Date().getTime() - start;
                    console.log(`habitat_details(): ${elapsed / 60000}m${elapsed / 1000}s${elapsed}ms`);

                    // Classification
                    let classifications: React.SetStateAction<Taxon[]> | { id: any; vernacularName: any; fullname: any; authority: any; rankName: any; }[];
                    start = new Date().getTime();
                    try {
                        classifications = await apiInstance.taxon_classification(details.parentId, lang === 'fr' ? 'french' : 'english');
                    } catch (error) {
                        classifications = [];
                    }
                    elapsed = new Date().getTime() - start;
                    console.log(`taxon_classification(): ${elapsed / 60000}m${elapsed / 1000}s${elapsed}ms`);

                    // Statuts
                    let statuts;
                    start = new Date().getTime();
                    try {
                        statuts = await apiInstance.taxon_statuts(details.parentId, lang === 'fr' ? 'french' : 'english');
                    } catch (error) {
                        statuts = [];
                    }
                    elapsed = new Date().getTime() - start;
                    console.log(`taxon_statuts(): ${elapsed / 60000}m${elapsed / 1000}s${elapsed}ms`);

                    // Bibliographie
                    let bibliographie;
                    start = new Date().getTime();
                    try {
                        bibliographie = await apiInstance.taxon_bibliographie(taxon);
                    } catch (error) {
                        bibliographie = [];
                    }
                    elapsed = new Date().getTime() - start;
                    console.log(`taxon_bibliographie(): ${elapsed / 60000}m${elapsed / 1000}s${elapsed}ms`);

                    // console.log(bibliographie);

                    // Liens externes
                    start = new Date().getTime();
                    const externalIds = await apiInstance.taxon_externalIds(taxon);
                    elapsed = new Date().getTime() - start;
                    console.log(`taxon_externalIds(): ${elapsed / 60000}m${elapsed / 1000}s${elapsed}ms`);

                    // console.log(details);
                    // console.log(classifications);

                    setDetails(details);
                    setHabitat(habitat);
                    setClassifications(classifications);
                    setStatuts(statuts);
                    setBibliographie(bibliographie);
                    setExternalIds(externalIds);

                    // Filtrage des statuts ZNIEFF
                    if (statuts["ZNIEFF"]) {
                        const filteredStatuts = statuts["ZNIEFF"].filter((statut: Status) => statut.statusRemarks && statut.statusRemarks.includes("Continental"));
                        setStatuts(prevStatuts => ({
                            ...prevStatuts,
                            "ZNIEFF": filteredStatuts
                        }));
                    }
                }
            } catch (error) {
                console.error('Une erreur est survenue lors de la récupération des données: ', error);

            } finally {
                let elapsed = new Date().getTime() - startUE;
                console.log(`useEffect(): ${elapsed / 60000}m${elapsed / 1000}s${elapsed}ms`);
            }
        };

        const checkIfInNaturotheque = async () => {
            if (user && taxon) {
                try {
                    const response = await fetch('/api/handleTaxon', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            operation: TaxonOperation.EXISTS,
                            id_membre: user.id,
                            idtaxon: taxon,
                        }),
                    });

                    const data = await response.json();

                    if (data.message === 'Taxon exists in naturotheque.') {
                        setIsInNaturotheque(true);
                    } else {
                        setIsInNaturotheque(false);
                    }
                } catch (error: any) {
                    console.error(error);
                }
            }
        };

        fetchData();
        checkIfInNaturotheque();
        setLoading(false);
    }, [taxon, user, lang]);

    const handleSavingTaxon = async (idtaxon: number) => {
        if (user) {
            // setLoading(true);
            const response = await fetch('/api/handleTaxon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    operation: isInNaturotheque ? TaxonOperation.DELETE : TaxonOperation.ADD,
                    id_membre: user.id,
                    idtaxon: idtaxon,
                }),
            });

            const data = await response.json();

            // alert(data.message);

            if (data.message === 'Taxon successfully saved.' || data.message === 'Taxon successfully deleted.') {
                setIsInNaturotheque(!isInNaturotheque);
            }
            // setLoading(false);
        }
    };

    const generateClassificationString = (results: Taxon) => {
        const classifications = [
            results.phylumName,
            results.className,
            results.orderName,
            results.familyName
        ].filter(Boolean);

        return classifications.length > 0 ? classifications.join(' > ') : 'Aucune classification disponible';
    }

    const handleParentClick = (parentId: string) => {
        window.open(`/details?taxon=${parentId}`, '_blank');
    };
    // console.log(statuts);

    const TaxonDetails = (
        <div className="container mt-4">
            {loading || !results ? (
                <LoadingSpinner />
            ) : (
                <div className={`card bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}> {/* BLACK THEME */}
                    <div className="card-body">
                        {user && results && (
                            <button
                                className={`btn ${isInNaturotheque ? 'btn-danger' : 'btn-primary'}`}
                                onClick={() => handleSavingTaxon(results.id)}
                                style={{ float: 'right' }}
                            >
                                {isInNaturotheque ? <IconBookmarkCheckFill /> : <IconBookmarkPlusFill />}
                            </button>
                        )}
                        <div className="container">
                            <h1 className="text-center mb-4">{t("Détails du taxon")}<br></br><strong>{results.scientificName}</strong><span style={{ fontSize: '20px' }}> (ID: {results.id})</span></h1>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <h2 className="text-center mb-3">{t("Photo(s)")}</h2>
                                    <ApiGetImage
                                        id={results.id}
                                        className="img-fluid rounded mx-auto d-block"
                                        getAllImages
                                    />
                                </div>
                            </div>
                            <div className="row mt-5 mb-3">
                                <div className="col-md-6">
                                    <h2 className="text-center mb-3">{t("Données TaxRef")}</h2>
                                    <div className="card">
                                        <ul className="list-group list-group-flush">
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}><strong>id:</strong> {results.id}</li> {/* BLACK THEME */}
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}><strong>vernacularClassName:</strong> {results.vernacularClassName}</li> {/* BLACK THEME */}
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}><strong>vernacularName:</strong> {results.vernacularName}</li> {/* BLACK THEME */}
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}><strong>parentId:</strong> {' '} {/* BLACK THEME */}
                                                {results.parentId !== undefined ? (
                                                    <span onClick={() => handleParentClick(String(results.parentId))} style={{ cursor: 'pointer', textDecoration: 'underline', color: '#3079CC' }}>
                                                        {results.parentId}
                                                    </span>
                                                ) : null}
                                            </li>
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}><strong>scientificName:</strong> {results.scientificName}</li> {/* BLACK THEME */}
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}><strong>authority:</strong> {results.authority}</li> {/* BLACK THEME */}
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}><strong>fullname:</strong> {results.fullname}</li> {/* BLACK THEME */}
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}><strong>genusName:</strong> {results.genusName}</li> {/* BLACK THEME */}
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}><strong>familyName:</strong> {results.familyName}</li> {/* BLACK THEME */}
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}><strong>orderName:</strong> {results.orderName}</li> {/* BLACK THEME */}
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}><strong>className:</strong> {results.className}</li> {/* BLACK THEME */}
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}><strong>vernacularKingdomName:</strong> {results.vernacularKingdomName}</li> {/* BLACK THEME */}
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}><strong>vernacularGroup1:</strong> {results.vernacularGroup1}</li> {/* BLACK THEME */}
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}><strong>vernacularGroup2:</strong> {results.vernacularGroup2}</li> {/* BLACK THEME */}
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}><strong>vernacularGroup3:</strong> {results.vernacularGroup3}</li> {/* BLACK THEME */}
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <h2>{t("Classification")}</h2>
                                    {results.familyName || results.orderName || results.className || results.phylumName ? (
                                        <div className='navbar bg-red rounded p-3' style={{ backgroundColor: theme === 'dark' ? '#3f474f' : '#e3f2fd' }}> {/* BLACK THEME from #e3f2fd to #3f474f */}
                                            {generateClassificationString(results)}
                                        </div>
                                    ) : (
                                        <p>{t("Aucune classification disponible")}</p>
                                    )}

                                    {classifications.length > 0 && (
                                        <div className='mt-4'>
                                            <ol>
                                                {classifications.map((taxon: Taxon, index: number) => (
                                                    <li key={taxon.id} className="taxon-item">
                                                        {`${taxon.rankName}: `}
                                                        <Link href={`/search?q=${taxon.scientificName}`} target="_blank" style={{ color: '#3079CC' }}>
                                                            {taxon.fullname}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}
                                </div>

                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <h2>{t("Habitats")}</h2>
                                    {results.habitat ? (
                                        <>
                                            <Image
                                                src={`https://inpn.mnhn.fr/img/especes/habitat/habitat-${results.habitat}.svg`}
                                                className="imc src-top"
                                                alt={`habitat ${results.habitat}`}
                                                width={40}
                                                height={40}
                                            />
                                            {habitat?.name ?? 'Unknown'}
                                        </>
                                    ) : (
                                        <p>{t("Aucun habitat disponible")}</p>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <>
                                        <h3>{t("Statuts biogéographiques")}</h3>
                                        {statuts && statuts["Statut biogéographique"] && statuts["Statut biogéographique"].length > 0 ? (
                                            <div>
                                                <table className={`table table-striped table-bordered ${theme === 'dark' ? 'table-dark' : ''}`}> {/* BLACK THEME (table-dark) */}
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">{t("Territoire")}</th>
                                                            <th scope="col">{t("Statut biogéographique")}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {statuts["Statut biogéographique"].map((statut: Status) => (
                                                            <tr key={statut.locationId + statut.statusCode}>
                                                                <td>
                                                                    <Image
                                                                        src={`https://inpn.mnhn.fr/img/especes/territoires/${statut.locationId}.svg`}
                                                                        className="imc src-top"
                                                                        alt={`Image ${statut.locationId}`}
                                                                        width={120}
                                                                        height={120}
                                                                    />
                                                                    {statut.locationName}
                                                                </td>
                                                                <td>
                                                                    <Image
                                                                        src={`https://inpn.mnhn.fr/img/especes/statuts_biogeographiques/stat_biogeo_${statut.BioGeoStatut ? 'PRESENT' : 'ABSENT'}.svg`}
                                                                        className="imc src-top"
                                                                        alt={`Image ${statut.BioGeoStatut ? 'present' : 'absent'}`}
                                                                        width={80}
                                                                        height={80}
                                                                    />
                                                                    {statut.BioGeoStatut ? "présent" : "absent"}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div>
                                                <p>{t("Aucun statut")}</p>
                                            </div>
                                        )}
                                    </>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <>
                                        <h2>{t("Bibliographie")}</h2>
                                        {bibliographie && bibliographie.length > 0 ? (
                                            <ul className="list-group mt-4">
                                                {bibliographie.map((bibliography: Bibliography) => (
                                                    bibliography.hrefToSource !== '' ? (
                                                        <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`} key={bibliography.sourceId}>  {/* BLACK THEME */}
                                                            <a href={bibliography.hrefToSource} target="_blank">
                                                                {bibliography.source}
                                                            </a>
                                                        </li>
                                                    ) : (
                                                        <li className="list-group-item" key={bibliography.sourceId}>
                                                            {bibliography.source}
                                                        </li>
                                                    )
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>{t("Aucune bibliographie disponible")}</p>
                                        )}
                                    </>
                                </div>
                                <div className="col-md-6">
                                    <>
                                        <h2>{t("Liens externes")}</h2>
                                        <ul className="list-group mt-4">
                                            <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`}> {/* BLACK THEME */}
                                                <a href={`https://inpn.mnhn.fr/espece/cd_nom/${results.id}`} target="_blank">
                                                    {t("Inventaire national du patrimoine naturel (INPN)")}
                                                </a>
                                            </li>
                                            {externalIds.map((externalId: any) => (
                                                <li className={`list-group-item bg-${theme} ${theme === 'dark' ? 'text-white' : ''}`} key={externalId.id + externalId.externalDbTitle}> {/* BLACK THEME */}
                                                    <a href={externalId.url} key={externalId.id}>
                                                        {externalId.externalDbTitle}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <>
                                        <h3>{t("Statuts d&apos;évaluation, de protection et de menace")}</h3>
                                        {statuts && statuts["Statut biogéographique"] && statuts["Liste rouge"] && statuts["ZNIEFF"] ? (
                                            <div>
                                                {statuts["Statut biogéographique"] && statuts["Statut biogéographique"].length > 0 ? (
                                                    <Image
                                                        src="https://inpn.mnhn.fr/img/especes/statut_evaluation/statut_espece_evaluee.svg"
                                                        title='Espèce évaluée'
                                                        alt="Espèce évaluée"
                                                        width={150}
                                                        height={150}
                                                    />
                                                ) : (
                                                    <div>
                                                        <p>{t("Aucun statut")}</p>
                                                    </div>
                                                )}
                                                {statuts["Liste rouge"] && statuts["Liste rouge"].length > 0 ? (
                                                    <Image
                                                        src="https://inpn.mnhn.fr/img/especes/statut_evaluation/statut_espece_protegee.svg"
                                                        title='Espèce protégée'
                                                        alt="Espèce protégée"
                                                        width={150}
                                                        height={150}
                                                    />
                                                ) : (
                                                    <div>
                                                        <p>{t("Aucun statut")}</p>
                                                    </div>
                                                )}
                                                {statuts["ZNIEFF"] && statuts["ZNIEFF"].length > 0 ? (
                                                    <Image
                                                        src="https://inpn.mnhn.fr/img/especes/statut_evaluation/statut_espece_znieff_espece_carasteristique.svg"
                                                        title='Espèce caractéristique'
                                                        alt="Espèce caractéristique"
                                                        width={150}
                                                        height={150}
                                                    />
                                                ) : (
                                                    <div>
                                                        <p>{t("Aucun statut")}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <p>{t("Aucun statut")}</p>
                                            </div>
                                        )}
                                    </>
                                </div>
                                <div className="col-md-6">
                                    <>
                                        <h3>{t("Espèce déterminante de l&apos;inventaire ZNIEFF")}</h3>
                                        {statuts && statuts["ZNIEFF"] && statuts["ZNIEFF"].length > 0 ? (
                                            <div>
                                                <table className={`table table-striped table-bordered ${theme === 'dark' ? 'table-dark' : ''}`}>
                                                    <thead>
                                                        <tr>
                                                            <th>{t("Région")}</th>
                                                            <th>{t("Sources")}</th>
                                                            <th>{t("Domaine")}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {statuts["ZNIEFF"].map((statut: Status, index: number) => (
                                                            <tr key={`${index}`}>
                                                                <td>{statut.locationName}</td>
                                                                <td>{statut.authorSource}</td>
                                                                <td>{t("Continental")}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div>
                                                <p>{t("Aucun statut")}</p>
                                            </div>
                                        )}
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
            <span style={{ userSelect: 'none' }}>&nbsp;</span>
        </div >
    );


    if (!user) {
        return (
            <>
                {TaxonDetails}
            </>
        );
    } else {
        // Utilisateur connecté
        return (
            <div className='container-fluid mt-4'>
                {TaxonDetails}
            </div>
        );
    }
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

export default Details;
