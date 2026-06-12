import React, { useState } from 'react';
import './SessionTypeModal.css';

const SessionTypeModal = ({ isOpen, onClose, onSelect }) => {
    const [showSafety, setShowSafety] = useState(false);

    if (!isOpen) return null;

    const handleInPersonClick = () => {
        setShowSafety(true);
    };

    const handleConfirmInPerson = () => {
        onSelect('inperson');
        setShowSafety(false);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{showSafety ? 'Safety Warning' : 'Start Learning Session'}</h2>
                </div>

                {!showSafety ? (
                    <div className="modal-options">
                        <button className="option-btn" onClick={() => onSelect('chat')}>
                            <span>💬</span> Chat Session
                        </button>
                        <button className="option-btn" onClick={() => onSelect('video')}>
                            <span>🎥</span> Video Session
                        </button>
                        <button className="option-btn" onClick={handleInPersonClick}>
                            <span>📍</span> In-Person Session
                        </button>
                    </div>
                ) : (
                    <div className="modal-options">
                        <div className="safety-warning">
                            <span>⚠️</span>
                            <p>Meet only in safe public places. Always inform someone of your whereabouts. Do not share personal info before meeting.</p>
                        </div>
                        <button className="option-btn" style={{ background: '#10b981', color: 'white', borderColor: '#10b981' }} onClick={handleConfirmInPerson}>
                            ✓ Mark as Started
                        </button>
                    </div>
                )}

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={() => (showSafety ? setShowSafety(false) : onClose())}>
                        {showSafety ? 'Back' : 'Cancel'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionTypeModal;
