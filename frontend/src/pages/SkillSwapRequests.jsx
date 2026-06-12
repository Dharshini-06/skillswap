import React, { useState, useEffect, useCallback } from 'react';
import './MainDashboard.css';
import './MySkills.css';
import Sidebar from '../components/Sidebar';
import SuccessModal from '../components/SuccessModal';
import RatingModal from '../components/RatingModal';
import { Inbox, Send, CheckCircle, Zap, User, Clock, XCircle, Star, ArrowLeftRight } from 'lucide-react';

const SkillSwapRequests = () => {
    const userId = localStorage.getItem('userId');
    const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' or 'outgoing'
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' });
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingData, setRatingData] = useState({ mentorId: '', skillName: '' });

    // Theme state
    const [isDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('skillnova-theme');
        return savedTheme === 'dark';
    });

    useEffect(() => {
        localStorage.setItem('skillnova-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);


    const fetchRequests = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/dashboard`, {
                headers: { 'x-user-id': userId }
            });
            const data = await response.json();
            setIncomingRequests(Array.isArray(data.pendingRequests) ? data.pendingRequests : []);
            setSentRequests(Array.isArray(data.sentRequests) ? data.sentRequests : []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAcceptReject = async (requestId, action) => {
        try {
            const res = await fetch(`http://localhost:5000/api/swap/${action}/${requestId}`, {
                method: 'POST'
            });
            if (res.ok) {
                setModalConfig({
                    title: action === 'accept' ? 'Accepted!' : 'Rejected',
                    message: `You have successfully ${action}ed the swap request.`,
                    type: 'success'
                });
                setShowModal(true);
                fetchRequests();
            }
        } catch (err) {
            console.error(`Error ${action}ing request`, err);
        }
    };

    const allRequests = [...(incomingRequests || []), ...(sentRequests || [])];
    const acceptedCount = allRequests.filter(req => req.status === 'accepted').length;

    const stats = [
        { label: "Incoming Requests", value: (incomingRequests || []).length.toString(), icon: <Inbox size={20} /> },
        { label: "Outgoing Requests", value: (sentRequests || []).length.toString(), icon: <Send size={20} /> },
        { label: "Accepted Swaps", value: acceptedCount.toString(), icon: <CheckCircle size={20} /> },
        { label: "Active Sessions", value: acceptedCount.toString(), icon: <Zap size={20} /> }
    ];

    const openRatingModal = (mentorId, skillName) => {
        setRatingData({ mentorId, skillName });
        setShowRatingModal(true);
    };

    const handleRatingSubmit = async (ratingNum) => {
        try {
            const res = await fetch(`http://localhost:5000/api/users/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mentorId: ratingData.mentorId,
                    skillName: ratingData.skillName,
                    rating: ratingNum
                })
            });

            if (res.ok) {
                setShowRatingModal(false);
                setModalConfig({
                    title: 'Thank You!',
                    message: 'Your rating has been submitted successfully.',
                    type: 'success'
                });
                setShowModal(true);
                fetchRequests();
            }
        } catch (err) {
            console.error("Error rating mentor:", err);
        }
    };


    return (
        <div className={`main-dashboard ${isDarkMode ? 'dark-theme' : ''}`}>
            <Sidebar activeItem="requests" />

            <main className="dashboard-main">
                <div className="my-skills-container">
                    {/* Header */}
                    <div className="page-header-section">
                        <div className="header-text">
                            <h1>Skill Swap Requests</h1>
                            <p>Manage your incoming and outgoing skill exchange requests.</p>
                        </div>
                    </div>

                    {/* Analytics Row */}
                    <div className="analytics-row">
                        {stats.map((stat, index) => (
                            <div key={index} className="analytics-card">
                                <div className="stat-icon">{stat.icon}</div>
                                <div className="stat-info">
                                    <h4>{stat.label}</h4>
                                    <span>{stat.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="skills-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'incoming' ? 'active' : ''}`}
                            onClick={() => setActiveTab('incoming')}
                        >
                            Incoming Requests
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'outgoing' ? 'active' : ''}`}
                            onClick={() => setActiveTab('outgoing')}
                        >
                            Outgoing Requests
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="skills-section-container">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading requests...</div>
                        ) : activeTab === 'incoming' ? (
                            <div className="skills-content">
                                {(incomingRequests || []).length > 0 ? (
                                    <div className="skills-grid">
                                        {incomingRequests.map(request => (
                                            <div key={request._id} className="professional-skill-card">
                                                {/* User Info */}
                                                <div className="skill-card-top">
                                                    <div className="skill-main-info">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                            <div className="user-avatar-small" style={{ fontSize: '1.5rem', background: 'var(--accent-color)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><User size={20} /></div>
                                                            <h3 style={{ marginBottom: 0 }}>{request.sender?.name || 'User'}</h3>
                                                        </div>
                                                        <div className="badge-group">
                                                            <span className="skill-badge badge-level" style={{ textTransform: 'capitalize' }}>{request.status}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Skill Exchange Info */}
                                                <div style={{
                                                    background: 'var(--bg-secondary)',
                                                    padding: '1.25rem',
                                                    borderRadius: '16px',
                                                    marginTop: '1rem'
                                                }}>
                                                    <div style={{ marginBottom: '1rem' }}>
                                                        <label style={{
                                                            fontSize: '0.75rem',
                                                            color: 'var(--text-secondary)',
                                                            textTransform: 'uppercase',
                                                            fontWeight: 600,
                                                            display: 'block',
                                                            marginBottom: '0.5rem'
                                                        }}>They Offer</label>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                            {(request.skillsOffered && request.skillsOffered.length > 0) ? (
                                                                <span className="skill-badge badge-popular">{request.skillsOffered[0]}</span>
                                                            ) : (
                                                                <span className="skill-badge badge-level">No skills listed</span>
                                                            )}
                                                        </div>

                                                    </div>

                                                    <div style={{
                                                        textAlign: 'center',
                                                        margin: '0.75rem 0',
                                                        fontSize: '1.25rem',
                                                        color: 'var(--accent-color)'
                                                    }}><ArrowLeftRight size={20} /></div>

                                                    <div>
                                                        <label style={{
                                                            fontSize: '0.75rem',
                                                            color: 'var(--text-secondary)',
                                                            textTransform: 'uppercase',
                                                            fontWeight: 600,
                                                            display: 'block',
                                                            marginBottom: '0.5rem'
                                                        }}>They Want to Learn</label>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                            {(request.skillsWanted && request.skillsWanted.length > 0) ? (
                                                                <span className="skill-badge badge-level" style={{ background: 'rgba(124, 58, 237, 0.2)', color: 'var(--accent-color)' }}>{request.skillsWanted[0]}</span>
                                                            ) : (
                                                                <span className="skill-badge badge-level">No skills listed</span>
                                                            )}
                                                        </div>

                                                    </div>
                                                </div>

                                                {/* Availability Info */}
                                                <div className="skill-meta-grid">
                                                    <div className="meta-item">
                                                        <label>Availability</label>
                                                        <span>{request.sender?.availableDays?.join(', ') || 'Flexible'}</span>
                                                    </div>
                                                    <div className="meta-item">
                                                        <label>Time Slot</label>
                                                        <span>{request.sender?.preferredTimeSlots?.[0] || 'Flexible'}</span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                {request.status === 'pending' && (
                                                    <div className="card-actions">
                                                        <button
                                                            className="action-btn primary"
                                                            onClick={() => handleAcceptReject(request._id, 'accept')}
                                                        >
                                                            <CheckCircle size={16} style={{ marginRight: '4px' }} /> Accept
                                                        </button>
                                                        <button
                                                            className="action-btn danger"
                                                            onClick={() => handleAcceptReject(request._id, 'reject')}
                                                        >
                                                            <XCircle size={16} style={{ marginRight: '4px' }} /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState type="incoming" />
                                )}
                            </div>
                        ) : (
                            <div className="skills-content">
                                {(sentRequests || []).length > 0 ? (
                                    <div className="skills-grid">
                                        {sentRequests.map(request => (
                                            <div key={request._id} className="professional-skill-card">
                                                {/* User Info */}
                                                <div className="skill-card-top">
                                                    <div className="skill-main-info">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                            <div className="user-avatar-small" style={{ fontSize: '1.5rem', background: 'var(--accent-color)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><User size={20} /></div>
                                                            <h3 style={{ marginBottom: 0 }}>{request.receiver?.name || 'User'}</h3>
                                                        </div>
                                                        <div className="badge-group">
                                                            <span className={`skill-badge ${request.status === 'accepted' ? 'badge-popular' :
                                                                request.status === 'rejected' ? 'badge-demand' :
                                                                    'badge-level'
                                                                }`} style={{ textTransform: 'capitalize' }}>
                                                                {request.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Skill Exchange Info */}
                                                <div style={{
                                                    background: 'var(--bg-secondary)',
                                                    padding: '1.25rem',
                                                    borderRadius: '16px',
                                                    marginTop: '1rem'
                                                }}>
                                                    <div style={{ marginBottom: '1rem' }}>
                                                        <label style={{
                                                            fontSize: '0.75rem',
                                                            color: 'var(--text-secondary)',
                                                            textTransform: 'uppercase',
                                                            fontWeight: 600,
                                                            display: 'block',
                                                            marginBottom: '0.5rem'
                                                        }}>You Want</label>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                            {(request.skillsWanted && request.skillsWanted.length > 0) ? (
                                                                <span className="skill-badge badge-popular">{request.skillsWanted[0]}</span>
                                                            ) : (
                                                                <span className="skill-badge badge-level">No skills listed</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        textAlign: 'center',
                                                        margin: '0.75rem 0',
                                                        fontSize: '1.25rem',
                                                        color: 'var(--accent-color)'
                                                    }}><ArrowLeftRight size={20} /></div>

                                                    <div>
                                                        <label style={{
                                                            fontSize: '0.75rem',
                                                            color: 'var(--text-secondary)',
                                                            textTransform: 'uppercase',
                                                            fontWeight: 600,
                                                            display: 'block',
                                                            marginBottom: '0.5rem'
                                                        }}>You Offer</label>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                            {(request.skillsOffered && request.skillsOffered.length > 0) ? (
                                                                <span className="skill-badge badge-level" style={{ background: 'rgba(124, 58, 237, 0.2)', color: 'var(--accent-color)' }}>{request.skillsOffered[0]}</span>
                                                            ) : (
                                                                <span className="skill-badge badge-level">No skills listed</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>


                                                {/* Availability Info */}
                                                <div className="skill-meta-grid">
                                                    <div className="meta-item">
                                                        <label>Availability</label>
                                                        <span>{request.receiver?.availableDays?.join(', ') || 'Flexible'}</span>
                                                    </div>
                                                    <div className="meta-item">
                                                        <label>Time Slot</label>
                                                        <span>{request.receiver?.preferredTimeSlots?.[0] || 'Flexible'}</span>
                                                    </div>
                                                </div>

                                                {/* Status Display Only */}
                                                <div style={{
                                                    padding: '1rem',
                                                    background: 'var(--bg-secondary)',
                                                    borderRadius: '12px',
                                                    textAlign: 'center',
                                                    marginTop: 'auto'
                                                }}>
                                                    <span style={{
                                                        fontSize: '0.85rem',
                                                        color: 'var(--text-secondary)',
                                                        fontWeight: 600,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        justifyContent: 'center',
                                                        marginBottom: request.status === 'accepted' ? '0.5rem' : '0'
                                                    }}>
                                                        {request.status === 'pending' && <><Clock size={16} /> Waiting for response...</>}
                                                        {request.status === 'accepted' && <><CheckCircle size={16} color="#10b981" /> Request accepted! Start your swap.</>}
                                                        {request.status === 'rejected' && <><XCircle size={16} color="#ef4444" /> Request was declined.</>}
                                                    </span>
                                                    {request.status === 'accepted' && (
                                                        <button
                                                            className="action-btn primary"
                                                            style={{ width: '100%', marginTop: '0.5rem' }}
                                                            onClick={() => openRatingModal(request.receiver._id, request.skillsWanted[0])}
                                                        >
                                                            <Star size={16} style={{ marginRight: '4px' }} /> Rate Mentor
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState type="outgoing" />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <footer className="dashboard-footer">
                    <p>© 2026 SkillSwap . Your growth, our mission.</p>
                </footer>
            </main>

            <SuccessModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />

            <RatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onSubmit={handleRatingSubmit}
                skillName={ratingData.skillName}
            />
        </div>
    );
};

const EmptyState = ({ type }) => (
    <div className="empty-state-container">
        <div className="empty-illustration">{type === 'incoming' ? <Inbox size={48} /> : <Send size={48} />}</div>
        <h3>No {type} requests yet.</h3>
        <p>
            {type === 'incoming'
                ? 'When someone wants to swap skills with you, their requests will appear here.'
                : 'You haven\'t sent any skill swap requests yet. Browse mentors to get started.'}
        </p>
    </div>
);

export default SkillSwapRequests;
