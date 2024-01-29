import React, { CSSProperties } from 'react';

interface LoadingSpinnerProps {
    shouldBeOverlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ shouldBeOverlay = false }) => {
    const overlayStyle: CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
    };

    // TODO: Supprimer duplication de code ici
    return (
        !shouldBeOverlay ? (
            <div className="position-absolute top-50 start-50 translate-middle">
                <div className={`container-fluid d-flex justify-content-center align-items-center ${shouldBeOverlay ? 'overlay' : ''}`} style={shouldBeOverlay ? overlayStyle : {}}>
                    <div className="spinner-border spinner-border" role="status" style={{ width: "3rem", height: "3rem" }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        ) : (
            <div className={`container-fluid d-flex justify-content-center align-items-center ${shouldBeOverlay ? 'overlay' : ''}`} style={shouldBeOverlay ? overlayStyle : {}}>
                <div className="spinner-border spinner-border-lg" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    );
};

export default LoadingSpinner;