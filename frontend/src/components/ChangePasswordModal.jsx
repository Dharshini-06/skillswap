import React, { useState, useEffect } from 'react';
import './ChangePasswordModal.css';

const ChangePasswordModal = ({ isOpen, onClose, onSuccess, onError }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword !== formData.confirmNewPassword) {
            setError("New passwords don't match!");
            return;
        }

        if (formData.newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }

        setIsLoading(true);
        const userId = localStorage.getItem("userId");

        try {
            const res = await fetch('https://://skillswap-ekvn.onrender.com/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                onSuccess("Password updated successfully! Rocketing through security 🚀");
                setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
                onClose();
            } else {
                setError(data.message || "Failed to update password.");
                if (onError) onError(data.message || "Failed to update password.");
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay change-password-overlay" onClick={handleOverlayClick}>
            <div className="change-password-card">
                <div className="modal-header">
                    <h2 className="modal-title">Change Password</h2>
                </div>

                <form onSubmit={handleSubmit} className="change-password-form">
                    <div className="form-group">
                        <label>Current Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => toggleVisibility('current')}
                            >
                                {showPasswords.current ? "👁️" : "🙈"}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => toggleVisibility('new')}
                            >
                                {showPasswords.new ? "👁️" : "🙈"}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                name="confirmNewPassword"
                                value={formData.confirmNewPassword}
                                onChange={handleChange}
                                required
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => toggleVisibility('confirm')}
                            >
                                {showPasswords.confirm ? "👁️" : "🙈"}
                            </button>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save" disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
