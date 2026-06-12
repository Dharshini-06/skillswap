import React, { useState, useEffect } from 'react';
import './MainDashboard.css';
import './Settings.css';
import Sidebar from '../components/Sidebar';
import SuccessModal from '../components/SuccessModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { SunMoon, Shield, Key, Bell, Lock } from 'lucide-react';

const Settings = () => {

    // Theme state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('skillnova-theme');
        return savedTheme === 'dark';
    });

    useEffect(() => {
        localStorage.setItem('skillnova-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' });
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    // Mock Settings state
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [profileVisibility, setProfileVisibility] = useState('Public');


    const handleVisibilityToggle = (e) => {
        setProfileVisibility(e.target.checked ? 'Public' : 'Private');
    };

    return (
        <div className={`main-dashboard ${isDarkMode ? 'dark-theme' : ''}`}>
            <Sidebar activeItem="settings" />

            <main className="dashboard-main">
                <div className="settings-container">
                    <header className="settings-header">
                        <h1>Settings</h1>
                        <p>Manage your account preferences and adjust SkillSwap to your liking.</p>
                    </header>

                    <div className="settings-grid">
                        {/* Appearance Section */}
                        <section className="settings-card">
                            <h3><SunMoon size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Appearance</h3>
                            <div className="settings-item">
                                <div className="settings-info">
                                    <h4>Dark Mode</h4>
                                    <p>Toggle between light and dark theme for the entire app.</p>
                                </div>
                                <div className="settings-control">
                                    <label className="switch">
                                        <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Security Section */}
                        <section className="settings-card">
                            <h3><Shield size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Security</h3>
                            <div className="settings-item">
                                <div className="settings-info">
                                    <h4>Password Management</h4>
                                    <p>Change your account password securely.</p>
                                </div>
                                <div className="settings-control">
                                    <button
                                        className="btn-change-password"
                                        onClick={() => setIsChangePasswordOpen(true)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Key size={18} /> Change Password
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Notifications Section */}
                        <section className="settings-card">
                            <h3><Bell size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Notifications</h3>
                            <div className="settings-item">
                                <div className="settings-info">
                                    <h4>Email Notifications</h4>
                                    <p>Receive updates about swap requests and new feed items.</p>
                                </div>
                                <div className="settings-control">
                                    <label className="switch">
                                        <input type="checkbox" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Privacy Section */}
                        <section className="settings-card">
                            <h3><Lock size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Privacy</h3>
                            <div className="settings-item">
                                <div className="settings-info">
                                    <h4>Profile Visibility</h4>
                                    <p>Control who can see your profile and skills. Currently set to: <b>{profileVisibility}</b></p>
                                </div>
                                <div className="settings-control">
                                    <label className="switch">
                                        <input type="checkbox" checked={profileVisibility === 'Public'} onChange={handleVisibilityToggle} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <footer className="dashboard-footer">
                    <p>© 2026 SkillSwap . Built for growth.</p>
                </footer>
            </main>

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
                onSuccess={(msg) => {
                    setModalConfig({ title: 'Updated!', message: msg, type: 'success' });
                    setShowModal(true);
                }}
                onError={(err) => {
                    setModalConfig({ title: 'Error', message: err, type: 'error' });
                    setShowModal(true);
                }}
            />

            <SuccessModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
        </div>
    );
};

export default Settings;
