import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RatingModal from '../components/RatingModal';
import SessionTypeModal from '../components/SessionTypeModal';
import VideoCallModal from '../components/VideoCallModal';
import axios from 'axios';
import './MainDashboard.css';
import './MySkills.css';
import Sidebar from '../components/Sidebar';
import { User, RefreshCw, Zap, Clock, CheckCircle, Loader2, Star, Video, Rocket, Flag, RotateCcw, Handshake, Inbox } from 'lucide-react';




const SwapProgressTracker = () => {
    const navigate = useNavigate();
    const [swaps, setSwaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedSwap, setSelectedSwap] = useState(null);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
    const [activeSwapId, setActiveSwapId] = useState(null);


    // Theme state
    const [isDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('skillnova-theme');
        return savedTheme === 'dark';
    });

    const fetchSwaps = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://://skillswap-ekvn.onrender.com/api/user', {
                headers: { 'x-user-id': userId }
            });
            setSwaps(response.data);
        } catch (error) {
            console.error('Error fetching swaps:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchSwaps();
    }, [fetchSwaps]);

    const handleAction = async (swapId, action) => {
        if (action === 'feedback') {
            const swap = swaps.find(s => s._id === swapId);
            setSelectedSwap(swap);
            setIsRatingModalOpen(true);
            return;
        }

        if (action === 'start') {
            setActiveSwapId(swapId);
            setIsSessionModalOpen(true);
            return;
        }

        try {
            let endpoint = '';
            if (action === 'complete') endpoint = `/api/swap/complete/${swapId}`;
            if (action === 'reset') endpoint = `/api/swap/reset-session/${swapId}`;

            const res = await axios.put(`https://://skillswap-ekvn.onrender.com${endpoint}`, {}, {

                headers: { 'x-user-id': userId }
            });

            if (action === 'complete' && res.data && res.data.success) {
                setSwaps(prevSwaps => prevSwaps.map(s =>
                    s._id === swapId
                        ? res.data.swap
                        : s
                ));
            }

            fetchSwaps(); // Refresh data
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
        }
    };

    const handleSelectSessionType = async (type) => {
        try {
            await axios.post(`https://://skillswap-ekvn.onrender.com/api/start-session/${activeSwapId}`, {

                sessionType: type
            }, {
                headers: { 'x-user-id': userId }
            });

            setIsSessionModalOpen(false);

            if (type === 'chat') {
                navigate('/messages', { state: { swapId: activeSwapId } });
            } else if (type === 'video') {
                navigate(`/video-call/${activeSwapId}`);
            } else {
                fetchSwaps(); // Refresh to show ongoing status
            }

        } catch (error) {
            console.error('Error starting session:', error);
            alert('Failed to start session. Please try again.');
        }
    };


    const handleFeedbackSubmit = async (rating, description) => {
        try {
            const toUserId = selectedSwap.sender && selectedSwap.sender._id === userId
                ? selectedSwap.receiver?._id
                : selectedSwap.sender?._id;
            await axios.post(`https://://skillswap-ekvn.onrender.com/api/feedback`, {
                sessionId: selectedSwap._id,
                toUserId,
                fromUserId: userId,
                rating,
                comment: description
            });
            setIsRatingModalOpen(false);
            fetchSwaps(); // Refresh data
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        }
    };




    const getOtherPerson = (swap) => {
        if (!swap.sender || !swap.receiver) return { name: "Unknown User", avatar: <User /> };
        return swap.sender._id === userId ? swap.receiver : swap.sender;
    };

    const stepsList = [
        { key: 'requestSent', label: 'Request Sent' },
        { key: 'accepted', label: 'Accepted' },
        { key: 'sessionStarted', label: 'Session Started' },
        { key: 'sessionsCompleted', label: 'Sessions Completed' },
        { key: 'feedbackGiven', label: 'Feedback Given' },
        { key: 'completed', label: 'Completed' }
    ];

    const stats = [
        { label: "Active Swaps", value: swaps.filter(s => s.status !== 'completed').length.toString(), icon: <RefreshCw size={20} /> },
        { label: "Ongoing", value: swaps.filter(s => s.status === 'ongoing').length.toString(), icon: <Zap size={20} /> },
        { label: "Pending", value: swaps.filter(s => s.status === 'pending').length.toString(), icon: <Clock size={20} /> },
        { label: "Completed", value: swaps.filter(s => s.status === 'completed').length.toString(), icon: <CheckCircle size={20} /> }
    ];

    return (
        <div className={`main-dashboard ${isDarkMode ? 'dark-theme' : ''}`}>
            <Sidebar activeItem="progress" />

            <main className="dashboard-main">
                <div className="my-skills-container">
                    {/* Header */}
                    <div className="page-header-section">
                        <div className="header-text">
                            <h1>Swap Progress Tracker</h1>
                            <p>Monitor your skill exchange journey and track session milestones.</p>
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

                    {/* Main Content */}
                    <div className="skills-section-container">
                        <div className="skills-content">
                            {loading ? (
                                <div className="empty-state-container">
                                    <div className="empty-illustration"><Loader2 size={48} /></div>
                                    <h3>Loading your swaps...</h3>
                                </div>
                            ) : swaps.length > 0 ? (
                                <div className="skills-grid">
                                    {swaps.map(swap => {
                                        const otherPerson = getOtherPerson(swap);
                                        const progress = Math.round(((swap.completedSessions || 0) / 10) * 100);

                                        // Debug current swap data
                                        console.log("Swap Data:", swap);

                                        // Role-based mapping using correct database fields (skillsWanted and skillsOffered)
                                        const isRequester = swap.sender && swap.sender._id === userId;

                                        const learningSkill = isRequester
                                            ? (swap.skillsWanted && swap.skillsWanted[0])
                                            : (swap.skillsOffered && swap.skillsOffered[0]);

                                        const teachingSkill = isRequester
                                            ? (swap.skillsOffered && swap.skillsOffered[0])
                                            : (swap.skillsWanted && swap.skillsWanted[0]);

                                        // Final display text with safe fallback
                                        const learningDisplay = (learningSkill && learningSkill !== "General Skills") ? learningSkill : "Not specified";
                                        const teachingDisplay = (teachingSkill && teachingSkill !== "General Skills") ? teachingSkill : "Not specified";

                                        return (

                                            <div key={swap._id} className="professional-skill-card" style={{ minHeight: 'auto', gap: '1rem' }}>
                                                {/* Card Header */}
                                                <div className="skill-card-top">
                                                    <div className="skill-main-info">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                            <div style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                borderRadius: '50%',
                                                                backgroundColor: 'var(--bg-secondary)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '1.5rem',
                                                                overflow: 'hidden'
                                                            }}>
                                                                {otherPerson.profileImage ? (
                                                                    <img src={otherPerson.profileImage} alt={otherPerson.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : <User />}
                                                            </div>
                                                            <div>
                                                                <h3 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                    {otherPerson.name || "User"}
                                                                    {(otherPerson.role === 'Teacher' || otherPerson.role === 'teacher') && (
                                                                        <span title="Verified Mentor" aria-label="Verified Mentor" style={{ color: '#10b981' }}><CheckCircle size={16} /></span>
                                                                    )}
                                                                </h3>
                                                                <span className={`skill-badge status-${swap.status || 'pending'}`}>
                                                                    {swap.status || 'pending'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Skills Info */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Learning</label>
                                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-color)' }}>
                                                            {learningDisplay}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Teaching</label>
                                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#10b981' }}>
                                                            {teachingDisplay}
                                                        </p>
                                                    </div>
                                                </div>



                                                {/* Progress Bar */}
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                        <span style={{ color: 'var(--text-secondary)' }}>Overall Progress</span>
                                                        <span style={{ fontWeight: 700 }}>{progress}%</span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-color)', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
                                                    </div>
                                                    <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                                                        <p style={{ margin: '10px 0', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                            {swap.completedSessions || 0} / 10 Sessions Completed
                                                        </p>
                                                        <div className="session-progress">
                                                            {[...Array(10)].map((_, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`dot ${i < (swap.completedSessions || 0) ? "completed" : ""}`}
                                                                >
                                                                    {i < (swap.completedSessions || 0) ? <CheckCircle size={16} /> : i + 1}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Step Tracker */}
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.75rem' }}>
                                                        Milestones
                                                    </label>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                                        {stepsList.map(step => (
                                                            <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                                                <div style={{
                                                                    width: '16px',
                                                                    height: '16px',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid var(--border-color)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    background: swap.steps?.[step.key] ? 'var(--accent-color)' : 'transparent',
                                                                    borderColor: swap.steps?.[step.key] ? 'var(--accent-color)' : 'var(--border-color)',
                                                                    color: 'white'
                                                                }}>
                                                                    {swap.steps?.[step.key] && <CheckCircle size={12} />}
                                                                </div>
                                                                <span style={{ color: swap.steps?.[step.key] ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                                                    {step.label}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="card-actions" style={{ marginTop: '0.5rem' }}>
                                                    {swap.status !== 'completed' ? (
                                                        <>
                                                            {swap.steps?.sessionStarted ? (
                                                                <button
                                                                    className="action-btn primary"
                                                                    style={{ background: '#3b82f6' }}
                                                                    onClick={() => navigate(`/video-call/${swap._id}`)}
                                                                >
                                                                    <Video size={16} style={{ marginRight: '8px' }} /> Join Meeting
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="action-btn primary"
                                                                    onClick={() => handleAction(swap._id, 'start')}
                                                                >
                                                                    <Rocket size={16} style={{ marginRight: '8px' }} /> Start Session
                                                                </button>
                                                            )}

                                                            {swap.status === 'ongoing' && (
                                                                <button
                                                                    className="action-btn primary"
                                                                    style={{ background: '#10b981' }}
                                                                    onClick={() => handleAction(swap._id, 'complete')}
                                                                >
                                                                    <Flag size={16} style={{ marginRight: '8px' }} /> Mark Complete
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <button
                                                            className="action-btn primary"
                                                            style={{ background: '#3b82f6', marginBottom: '0.5rem' }}
                                                            onClick={() => navigate(`/video-call/${swap._id}`)}
                                                        >
                                                            <Video size={16} style={{ marginRight: '8px' }} /> Rejoin Video Session
                                                        </button>
                                                    )}


                                                    <button
                                                        className="action-btn"
                                                        onClick={() => handleAction(swap._id, 'feedback')}
                                                        disabled={(swap.completedSessions || 0) === 0 || swap.steps?.feedbackGiven}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                                                    >
                                                        <Star size={16} /> {swap.steps?.feedbackGiven ? 'Feedback Given' : 'Give Feedback'}
                                                    </button>

                                                    {swap.status === 'completed' && (
                                                        <button
                                                            className="action-btn"
                                                            style={{ fontSize: '0.7rem', opacity: 0.6, background: '#334155', color: 'white', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                                                            onClick={() => handleAction(swap._id, 'reset')}
                                                        >
                                                            <RotateCcw size={14} /> Reset Session (Test Only)
                                                        </button>
                                                    )}
                                                </div>

                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="empty-state-container">
                                    <div className="empty-illustration"><Handshake size={48} /></div>
                                    <h3>No active swaps yet.</h3>
                                    <p>Find matches and start swapping skills to track your progress here!</p>
                                    <button className="action-btn primary" style={{ maxWidth: '200px', margin: '0 auto' }} onClick={() => navigate('/dashboard')}>
                                        Find Mentors
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="dashboard-footer">
                    <p>© 2026 SkillSwap . Your growth, our mission.</p>
                </footer>
            </main>

            <RatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                onSubmit={handleFeedbackSubmit}
                skillName={selectedSwap?.learningSkill || "Skill"}
            />

            <SessionTypeModal
                isOpen={isSessionModalOpen}
                onClose={() => setIsSessionModalOpen(false)}
                onSelect={handleSelectSessionType}
            />

            <VideoCallModal
                isOpen={isVideoCallOpen}
                onClose={() => setIsVideoCallOpen(false)}
                onEnd={() => fetchSwaps()}
            />

            <style dangerouslySetInnerHTML={{

                __html: `
                .status-pending { background: #fef3c7; color: #92400e; }
                .status-accepted { background: #dcfce7; color: #166534; }
                .status-ongoing { background: #e0e7ff; color: #3730a3; }
                .status-completed { background: #f3f4f6; color: #374151; }
                .dark-theme .status-pending { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
                .dark-theme .status-accepted { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
                .dark-theme .status-ongoing { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
                .dark-theme .status-completed { background: rgba(156, 163, 175, 0.2); color: #d1d5db; }

                .session-progress {
                  display: flex;
                  gap: 8px;
                  margin-top: 10px;
                  flex-wrap: wrap;
                  justify-content: center;
                }

                .dot {
                  width: 35px;
                  height: 35px;
                  border-radius: 50%;
                  background: #1e293b;
                  color: white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                }

                .dot.completed {
                  background: #22c55e;
                  color: white;
                  font-weight: bold;
                }
            `}} />
        </div>
    );
};

export default SwapProgressTracker;
