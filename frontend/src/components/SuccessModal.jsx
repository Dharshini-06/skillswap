import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import './SuccessModal.css';

const SuccessModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-card">
                <div className={`modal-icon ${type}`}>
                    {type === 'success' ? <Check size={32} /> : <X size={32} />}
                </div>
                <h2 className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>
                <button className="modal-ok-btn" onClick={onClose}>
                    OK
                </button>
            </div>
        </div>
    );
};

export default SuccessModal;
