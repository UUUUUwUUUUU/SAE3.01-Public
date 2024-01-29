import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTheme } from '@providers/Themes';

interface ApiGetImageProps {
    id: number;
    className?: string;
    getAllImages?: boolean;
}

const ApiGetImage: React.FC<ApiGetImageProps> = ({ id, className, getAllImages }) => {
    const [imageLinks, setImageLinks] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    const { theme } = useTheme(); // TODO : Ajouter une image light & dark pour langue EN
    const placeholderImage = theme === 'light' ? '/images/PlaceholderTaxonLIGHT_FR.webp' : '/images/PlaceholderTaxonDARK_FR.webp';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://inpn.mnhn.fr/espece/cd_nom/${id}`);
                const html = await response.text();

                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const imageElements = doc.querySelectorAll('img.imageload:not([class*=" "])');
                const imageUrls = Array.from(imageElements).map((element) => element.getAttribute('src'));

                if (getAllImages) {
                    setImageLinks(imageUrls.filter(url => url !== null) as string[]);
                } else {
                    const firstImageUrl = imageUrls[0];
                    setImageLinks(firstImageUrl ? [firstImageUrl] : []);
                }
            } catch (error) {
                console.warn('Failed to get image of taxon with id', id);
                console.log('Full Error:', error);
                setImageLinks([]);
            }
        };

        fetchData();
    }, [id, getAllImages]);

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageLinks.length);
    };

    const handlePreviousImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageLinks.length) % imageLinks.length);
    };

    return (
        <div className={className} style={{ position: 'relative' }}>
            {imageLinks.length > 0 ? (
                <>
                    <Image
                        src={imageLinks[currentImageIndex]}
                        className={className}
                        alt={`Image ${currentImageIndex + 1} for ID ${id}`}
                        width={360}
                        height={360}
                    />
                    {getAllImages && imageLinks.length > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <button className="btn btn-primary m-2" onClick={handlePreviousImage}>Previous</button>
                            <button className="btn btn-primary" onClick={handleNextImage}>Next</button>
                        </div>
                    )}
                </>
            ) : (
                <Image src={placeholderImage} className={className} alt="Placeholder" width={500} height={500} priority />
            )}
        </div>
    );
};

export default ApiGetImage;
