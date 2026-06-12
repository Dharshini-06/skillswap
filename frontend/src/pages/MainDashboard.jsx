import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainDashboard.css';
import AIChatWidget from '../components/AIChatWidget';
import SuccessModal from '../components/SuccessModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import Sidebar from '../components/Sidebar';
import { Mail, Video, Settings, Bell, Moon, Sun, Rocket, Star, Flame, CheckCircle } from 'lucide-react';

const MainDashboard = ({ showMessagesModal = false }) => {
    const navigate = useNavigate();


    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' });

    // Theme state - Light by default
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('skillnova-theme');
        return savedTheme === 'dark';
    });

    // Dropdown state
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    // Notifications state
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const fetchNotifications = () => {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        fetch("http://localhost:5000/api/notifications", { headers: { "x-user-id": userId } })
            .then(res => res.json())
            .then(data => setNotifications(data))
            .catch(err => console.error("Error fetching notifications", err));
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => {
            fetchNotifications();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleNotificationClick = async (n) => {
        try {
            await fetch(`http://localhost:5000/api/notifications/read/${n._id}`, { method: 'PUT', headers: { 'x-user-id': localStorage.getItem("userId") } });
            fetchNotifications();
        } catch (err) { }

        if (n.type === 'email') navigate('/messages');
        else if (n.type === 'session') navigate(n.link || '/swap-progress');
        setShowNotifications(false);
    };

    const getNotificationIcon = (type) => {
        if (type === "email") return <Mail size={18} />;
        if (type === "session") return <Video size={18} />;
        if (type === "system") return <Settings size={18} />;
        return <Bell size={18} />;
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;


    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
    };


    // Profile completion state
    const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);

    // User details state
    const [userData, setUserData] = useState({
        name: localStorage.getItem('userName') || "User",
        role: localStorage.getItem('userRole') || "Student",
        profileType: localStorage.getItem('userProfileType') || "avatar",
        avatarUrl: localStorage.getItem('userAvatarUrl') || "",
        profileImage: localStorage.getItem('userProfileImage') || ""
    });

    // Suggested matches and requests state
    const [suggestedMatches, setSuggestedMatches] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [, setIsLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState([]);
    const [avgFeedback, setAvgFeedback] = useState({ avgRating: 0, count: 0 });
    // Profile Completion Logic
    const rolePref = localStorage.getItem('userRole');
    const countryPref = localStorage.getItem('userCountry');
    const bioPref = localStorage.getItem('userBio');
    const resumePref = localStorage.getItem('userResumeUploaded');
    const learnPref = localStorage.getItem('userSkillToLearn');
    const teachPref = localStorage.getItem('userSkillToTeach');
    const specPref = localStorage.getItem('userSpecialization');
    const instPref = localStorage.getItem('userInstitution');
    const expPref = localStorage.getItem('userExperience');

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            const logoutUser = () => {
                localStorage.clear();
                navigate('/login');
            };

            // Fetch User Profile
            fetch(`http://localhost:5000/api/profile/${userId}`)
                .then(res => {
                    if (res.status === 404) return logoutUser();
                    return res.json();
                })
                .then(data => {
                    if (data && data.name) {
                        setUserData({
                            name: data.name,
                            role: data.role || "Student",
                            profileType: data.profileType || 'avatar',
                            avatarUrl: data.avatarUrl || '',
                            profileImage: data.profileImage || ''
                        });
                        localStorage.setItem('userName', data.name);
                        localStorage.setItem('userRole', data.role || '');
                        localStorage.setItem('userCountry', data.country || '');
                        localStorage.setItem('userBio', data.bio || '');
                        localStorage.setItem('userInstitution', data.institution || '');
                        localStorage.setItem('userSpecialization', data.specialization || '');
                        localStorage.setItem('userExperience', data.experience || '');
                        localStorage.setItem('userSkillToLearn', data.skillsToLearn || '');
                        localStorage.setItem('userSkillToTeach', data.skillsToTeach || '');
                        localStorage.setItem('userResumeUploaded', data.resume ? 'true' : 'false');
                        localStorage.setItem('userProfileType', data.profileType || 'avatar');
                        localStorage.setItem('userAvatarUrl', data.avatarUrl || '');
                        localStorage.setItem('userProfileImage', data.profileImage || '');
                    }
                })
                .catch(err => console.error("Failed to fetch user data", err));

            // Fetch Dashboard Data (Requests)
            fetch(`http://localhost:5000/api/dashboard`, {
                headers: { 'x-user-id': userId }
            })
                .then(res => {
                    if (res.status === 404) return logoutUser();
                    return res.json();
                })
                .then(data => {
                    setIncomingRequests(Array.isArray(data.pendingRequests) ? data.pendingRequests : []);
                    setSentRequests(Array.isArray(data.sentRequests) ? data.sentRequests : []);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch dashboard data", err);
                    setIncomingRequests([]);
                    setSentRequests([]);
                    setIsLoading(false);
                });

            // Fetch Mutual Skill Matches
            fetch(`http://localhost:5000/api/users/matches`, {
                headers: { 'x-user-id': userId }
            })
                .then(res => {
                    if (res.status === 404) return logoutUser();
                    if (!res.ok) return [];
                    return res.json();
                })
                .then(data => {
                    setSuggestedMatches(Array.isArray(data) ? data : []);
                })
                .catch(err => {
                    console.error("Failed to fetch matches", err);
                    setSuggestedMatches([]);
                });

            // Fetch Feedback for dashboard
            fetch(`http://localhost:5000/api/feedback/${userId}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setFeedbacks(data.slice(0, 5));
                })
                .catch(err => console.error('Failed to fetch feedback', err));

            fetch(`http://localhost:5000/api/feedback/avg/${userId}`)
                .then(res => res.json())
                .then(data => setAvgFeedback({ avgRating: data.avgRating || 0, count: data.count || 0 }))
                .catch(err => console.error('Failed to fetch average rating', err));
        }
    }, [navigate]);

    const refreshData = () => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            // Re-fetch everything
            fetch(`http://localhost:5000/api/dashboard`, { headers: { 'x-user-id': userId } })
                .then(res => res.json())
                .then(data => {
                    setIncomingRequests(Array.isArray(data.pendingRequests) ? data.pendingRequests : []);
                    setSentRequests(Array.isArray(data.sentRequests) ? data.sentRequests : []);
                });
            fetch(`http://localhost:5000/api/users/matches`, { headers: { 'x-user-id': userId } })
                .then(res => res.json())
                .then(data => setSuggestedMatches(Array.isArray(data) ? data : []));
        }
    };

    const handleRequestSwap = async (receiverId) => {
        const userId = localStorage.getItem("userId");
        try {
            const res = await fetch(`http://localhost:5000/api/swap/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId
                },
                body: JSON.stringify({ receiverId })
            });
            const data = await res.json();
            if (res.ok) {
                setModalConfig({
                    title: 'Request Sent!',
                    message: 'Your swap request has been sent successfully. Waiting for their response! ',
                    type: 'success'
                });
                setShowModal(true);
                refreshData();
            } else {
                setModalConfig({
                    title: 'Oops!',
                    message: data.message || 'Failed to send request.',
                    type: 'error'
                });
                setShowModal(true);
            }
        } catch (err) {
            console.error("Error sending swap request", err);
        }
    };

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
                refreshData();
            }
        } catch (err) {
            console.error(`Error ${action}ing request`, err);
        }
    };

    // Dynamic Profile Completion Logic
    const calculateCompletion = () => {
        let filled = 0;
        let total = 0;

        // Uses state or localStorage? Use localStorage which is updated by the effect
        // OR use the data we just potentially fetched. 
        // For simplicity and consistency with current render cycle, we check localStorage but allow a small delay for the effect.
        // Actually, better to check the values we have access to. 
        // Since we update localStorage in the effect, we might need to force a re-calc or just read from localStorage directly in function 
        // IF we trigger a re-render. setState does trigger re-render.

        // 1. Role (Always required)
        if (localStorage.getItem('userRole')) filled++;
        total++;

        // 2. Country (Always required)
        if (localStorage.getItem('userCountry')) filled++;
        total++;

        // 3. Bio (Optional but collected)
        if (localStorage.getItem('userBio')) filled++;
        total++;

        // 4. Resume (Optional)
        if (localStorage.getItem('userResumeUploaded') === 'true') filled++;
        total++;

        // Role Specific Fields mapping
        const role = localStorage.getItem('userRole');
        if (role === "Skillswap Person") {
            // 5. Skill To Learn
            if (localStorage.getItem('userSkillToLearn')) filled++;
            total++;
            // 6. Skill To Teach
            if (localStorage.getItem('userSkillToTeach')) filled++;
            total++;
            // 7. Experience
            if (localStorage.getItem('userExperience')) filled++;
            total++;
        } else {
            // Student or Teaching Professional
            // 5. Specialization
            if (localStorage.getItem('userSpecialization')) filled++;
            total++;
            // 6. Institution
            if (localStorage.getItem('userInstitution')) filled++;
            total++;
            // 7. Experience/Year
            if (localStorage.getItem('userExperience')) filled++;
            total++;
        }

        if (total === 0) return 0;
        return Math.min(100, Math.round((filled / total) * 100));
    };

    useEffect(() => {
        setProfileCompletionPercentage(calculateCompletion());
    }, [rolePref, countryPref, bioPref, resumePref, learnPref, teachPref, specPref, instPref, expPref]);



    useEffect(() => {
        localStorage.setItem('skillnova-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    useEffect(() => {
        // No click outside logic needed since dropdown is removed
    }, []);





    // Trending skills state
    const [trendingSkills, setTrendingSkills] = useState(["React.js", "AI/ML", "UI/UX Design", "Python", "Cloud Computing", "Web3"]);
    const [trendingIndex, setTrendingIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        // Fetch Trending Skills
        fetch(`http://localhost:5000/api/users/trending-skills`)
            .then(res => res.json())
            .then(data => {
                if (data.trending && data.trending.length > 0) {
                    setTrendingSkills(data.trending);
                }
            })
            .catch(err => console.error("Failed to fetch trending skills", err));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setTrendingIndex((prev) => (prev + 3) % trendingSkills.length);
                setIsTransitioning(false);
            }, 400); // Wait for fade out
        }, 4000);

        return () => clearInterval(interval);
    }, [trendingSkills.length]);

    const visibleTrending = trendingSkills.slice(trendingIndex, trendingIndex + 3);

    return (
        <div className={`main-dashboard ${isDarkMode ? 'dark-theme' : ''}`}>
            {/* Sidebar component */}
            <Sidebar activeItem="dashboard" showMessagesModal={showMessagesModal} />

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="search-bar">
                        <input type="text" placeholder="Search skills, users, or topics..." />
                    </div>

                    <div className="header-actions">
                        <div className="theme-btn-header" onClick={toggleTheme} title="Toggle Theme">
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <div className="notification-btn" onClick={() => setShowNotifications(!showNotifications)} style={{ cursor: 'pointer', position: 'relative' }}>
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="badge" style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            {showNotifications && (
                                <div className="notification-dropdown" style={{ position: 'absolute', top: '40px', right: 0, width: '300px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxHeight: '400px', overflowY: 'auto' }}>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No notifications yet</div>
                                    ) : (
                                        notifications.map((n, i) => (
                                            <div key={n._id || i} className="notification-item" onClick={() => handleNotificationClick(n)} style={{ padding: '10px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', background: n.isRead ? 'transparent' : 'rgba(124, 58, 237, 0.1)' }}>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '1.2rem' }}>{getNotificationIcon(n.type)}</span>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{n.message}</p>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(n.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="user-profile-container">
                            <div className="user-profile" onClick={() => navigate('/profile')} title="My Profile">
                                <div className="avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {userData.profileType === 'avatar' ? (
                                        <img src={userData.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userData.name}`} alt="Avatar" style={{ width: '100%', height: '100%' }} />
                                    ) : (
                                        <img src={userData.profileImage ? `http://localhost:5000${userData.profileImage}` : ''} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </header>

                <section className="dashboard-content">
                    <div className="content-left">
                        <div className="welcome-banner">
                            <h1>Hi {userData.name && userData.name !== 'User' ? userData.name : 'Learner'}</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '-1.5rem', marginBottom: '2.5rem' }}>
                                Keep learning. Keep growing. Your next skill could change your future
                                <Rocket size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
                            </p>
                        </div>

                        <div className="requests-section">
                            <h3>Skill Swap Requests</h3>
                            {(!Array.isArray(incomingRequests) || incomingRequests.length === 0) && (!Array.isArray(sentRequests) || sentRequests.length === 0) && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No pending requests.</p>
                            )}
                            {Array.isArray(incomingRequests) && incomingRequests.map(req => (
                                <div className="request-item" key={req._id}>
                                    <div className="request-info">
                                        <strong>{req.sender.name}</strong> sent you an incoming request for <span>{req.sender.skillsWanted.join(', ')}</span>
                                    </div>
                                    <div className="request-actions">
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '0.4rem 1.2rem', borderRadius: '10px' }}
                                            onClick={() => handleAcceptReject(req._id, 'accept')}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.4rem 1.2rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }}
                                            onClick={() => handleAcceptReject(req._id, 'reject')}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {Array.isArray(sentRequests) && sentRequests.map(req => (
                                <div className="request-item" key={req._id}>
                                    <div className="request-info">
                                        Your request to <strong>{req.receiver?.name || 'Unknown'}</strong> for <span>{Array.isArray(req.receiver?.skillsOffered) ? req.receiver.skillsOffered.join(', ') : ''}</span>
                                    </div>
                                    <div className={`status-badge ${req.status}`}>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</div>
                                </div>
                            ))}
                        </div>

                        <div className="suggestions-section">
                            <h3>Suggested Matches</h3>
                            {(!Array.isArray(suggestedMatches) || suggestedMatches.length === 0) ? (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No perfect matches found yet.</p>
                            ) : (
                                suggestedMatches.map(match => {
                                    const avgRating = (match.teachingStats || []).length > 0
                                        ? (match.teachingStats.reduce((acc, curr) => acc + (curr.averageRating || 0), 0) / match.teachingStats.length).toFixed(1)
                                        : null;
                                    return (
                                        <div className="request-item" key={match._id}>
                                            <div className="request-info">
                                                <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    {match.name}
                                                    {(match.role === 'Teacher' || match.role === 'teacher') && (
                                                        <CheckCircle size={14} color="#10b981" title="Verified Mentor" />
                                                    )}
                                                </strong>
                                                {avgRating && <span style={{ color: '#fbbf24', marginLeft: '4px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}><Star size={14} fill="#fbbf24" />{avgRating}</span>} can teach <span>{Array.isArray(match.skillsOffered) ? match.skillsOffered.join(', ') : ''}</span> and wants to learn <span>{Array.isArray(match.skillsWanted) ? match.skillsWanted.join(', ') : ''}</span>
                                            </div>
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', borderRadius: '10px' }}
                                                onClick={() => handleRequestSwap(match._id)}
                                            >
                                                Request Swap
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <aside className="right-panel">
                        <div className="panel-card">
                            <h3>Profile Completion</h3>
                            <div className={`progress-circle ${profileCompletionPercentage === 100 ? 'full' : ''}`}>{profileCompletionPercentage}%</div>
                        </div>

                        <div className="panel-card">
                            <h3>Recent Feedback</h3>
                            {avgFeedback.count > 0 && (
                                <p style={{ margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Star size={16} fill="#fbbf24" color="#fbbf24" /> {avgFeedback.avgRating} ({avgFeedback.count} reviews)
                                </p>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {feedbacks.length === 0 ? (
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No feedback yet.</span>
                                ) : feedbacks.map(fb => (
                                    <div key={fb._id} className="feedback-card" style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                                        <p style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Star size={14} fill="#fbbf24" color="#fbbf24" /> {fb.rating}
                                        </p>
                                        {fb.comment && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>"{fb.comment}"</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="panel-card">
                            <h3>Trending Skills</h3>
                            <div
                                className="trending-list"
                                style={{
                                    opacity: isTransitioning ? 0 : 1,
                                    transition: 'opacity 0.4s ease'
                                }}
                            >
                                {visibleTrending.map((skill, idx) => (
                                    <div className="trending-item" key={skill + idx}>
                                        <Flame size={16} color="#ef4444" fill="#ef4444" /> {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </section>

                <footer className="dashboard-footer">
                    <p>© 2026 SkillSwap . All rights reserved.</p>
                </footer>
            </main>
            <AIChatWidget />

            {/* Success/Error Modal */}
            <SuccessModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />

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
        </div>
    );
};

export default MainDashboard;
