import React, { CSSProperties } from 'react';

interface ModalPopupProps {
    title: string;
    description: string;
    onClose: () => void;
    theme: 'light' | 'dark';
}

const ModalPopup: React.FC<ModalPopupProps> = ({ title, description, onClose, theme }) => {
    const popupStyle: CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999
    };

    const modalStyle: CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999
    };

    const modalClass = `modal-popUp ${theme}`;

    return (
        <div className="popup-overlay" style={popupStyle}>
            <div className="popup" style={modalStyle}>
                <div className={modalClass}>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <button className="btn btn-primary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalPopup;