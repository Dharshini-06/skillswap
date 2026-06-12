import React from 'react';
import './SessionTypeModal.css';

const VideoCallModal = ({ isOpen, onClose, onEnd }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px', width: '90%', background: '#111' }}>
                <div className="modal-header">
                    <h2 style={{ color: 'white', background: 'none', webkitTextFillColor: 'white' }}>Video Call Session</h2>
                    <p style={{ color: '#888' }}>Secure, high-quality skill exchange peer-to-peer connection.</p>
                </div>

                <div style={{
                    aspectRatio: '16/9',
                    background: '#1a1a1a',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ fontSize: '1.5rem', color: '#555', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📹</div>
                        Waiting for partner to join...
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
                    <button className="option-btn" style={{
                        background: '#ef4444',
                        color: 'white',
                        padding: '1rem 3rem',
                        borderColor: '#ef4444'
                    }} onClick={() => { onEnd(); onClose(); }}>
                        <span>🚫</span> End Call
                    </button>
                    <button className="option-btn" style={{
                        background: '#333',
                        color: 'white',
                        padding: '1rem 2rem'
                    }}>
                        <span>🎙️</span> Mute
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCallModal;
