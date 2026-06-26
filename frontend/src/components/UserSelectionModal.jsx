import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserSelectionModal.css';

const UserSelectionModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!isOpen) return;

        const fetchChats = async () => {
            try {
                // Fetch swaps that are accepted or ongoing to show as "chats"
                const res = await axios.get('https://skillswap-ekvn.onrender.com/api/user', {
                    headers: { 'x-user-id': userId }
                });
                setChats(res.data);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to fetch chats", err);
                setIsLoading(false);
            }
        };
        fetchChats();
    }, [isOpen, userId]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const handleUserClick = (userId) => {
        onClose();
        navigate(`/messages/session/${userId}`);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="user-selection-card">
                <div className="modal-header">
                    <h2 className="modal-title">Select User</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="user-list">
                    {isLoading ? (
                        <div className="loading-state">Loading users...</div>
                    ) : chats.length === 0 ? (
                        <div className="empty-state">No matches found yet.</div>
                    ) : (
                        chats.map(chat => {
                            const other = chat.sender._id === userId ? chat.receiver : chat.sender;
                            return (
                                <div
                                    key={other._id}
                                    className="user-row"
                                    onClick={() => handleUserClick(other._id)}
                                >
                                    <div className="user-initials">
                                        {other.name.charAt(0)}
                                    </div>
                                    <div className="user-name">
                                        {other.name}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSelectionModal;
