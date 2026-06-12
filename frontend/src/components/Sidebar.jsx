import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import UserSelectionModal from './UserSelectionModal';
import { LayoutDashboard, User, Wrench, ArrowLeftRight, LineChart, Newspaper, MessageSquare, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ activeItem, showMessagesModal = false }) => {
    const navigate = useNavigate();
    const [isUserModalOpen, setIsUserModalOpen] = useState(showMessagesModal);

    useEffect(() => {
        if (showMessagesModal) setIsUserModalOpen(true);
    }, [showMessagesModal]);


    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleMessagesClick = () => {
        setIsUserModalOpen(true);
    };

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <img src={logo} alt="SkillSwap" style={{ width: '32px' }} />
                    <span>SkillSwap</span>
                </div>

                <nav className="nav-links">
                    <div className={`nav-item ${activeItem === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
                        <span className="nav-icon"><LayoutDashboard size={20} /></span> Dashboard
                    </div>
                    <div className={`nav-item ${activeItem === 'profile' ? 'active' : ''}`} onClick={() => navigate('/profile')}>
                        <span className="nav-icon"><User size={20} /></span> My Profile
                    </div>
                    <div className={`nav-item ${activeItem === 'my-skills' ? 'active' : ''}`} onClick={() => navigate('/my-skills')}>
                        <span className="nav-icon"><Wrench size={20} /></span> My Skills
                    </div>
                    <div className={`nav-item ${activeItem === 'requests' ? 'active' : ''}`} onClick={() => navigate('/skill-swap-requests')}>
                        <span className="nav-icon"><ArrowLeftRight size={20} /></span> Skill Swap Requests
                    </div>
                    <div className={`nav-item ${activeItem === 'progress' ? 'active' : ''}`} onClick={() => navigate('/swap-progress')}>
                        <span className="nav-icon"><LineChart size={20} /></span> Swap Progress Tracker
                    </div>
                    <div className={`nav-item ${activeItem === 'feed' ? 'active' : ''}`} onClick={() => navigate('/learning-feed')}>
                        <span className="nav-icon"><Newspaper size={20} /></span> Learning Feed
                    </div>
                    <div className={`nav-item ${activeItem === 'messages' ? 'active' : ''}`} onClick={handleMessagesClick}>
                        <span className="nav-icon"><MessageSquare size={20} /></span> Messages
                    </div>

                    <div className={`nav-item ${activeItem === 'settings' ? 'active' : ''}`} onClick={() => navigate('/settings')}>
                        <span className="nav-icon"><Settings size={20} /></span> Settings
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="nav-item logout-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
                        <span className="nav-icon"><LogOut size={20} /></span> Logout
                    </div>
                </div>
            </aside>

            <UserSelectionModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
            />
        </>
    );
};

export default Sidebar;
