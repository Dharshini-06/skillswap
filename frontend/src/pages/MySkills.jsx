import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainDashboard.css';
import './MySkills.css';
import Sidebar from '../components/Sidebar';
import SuccessModal from '../components/SuccessModal';
import AddSkillModal from '../components/AddSkillModal';
import { GraduationCap, BookOpen, Handshake, Zap, Laptop, Rocket, Star, Edit, Trash2, Ban, Video, MessageSquare, MapPin, TrendingUp, Monitor } from 'lucide-react';

const MySkills = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const [activeTab, setActiveTab] = useState('teach'); // 'teach' or 'learn'
    const [loading, setLoading] = useState(false);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' });
    const [isEditingPrefs, setIsEditingPrefs] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Dynamic userData state
    const [userData, setUserData] = useState({
        skillsToTeach: [],
        skillsToLearn: [],
        availableDays: [],
        preferredTimeSlots: [],
        sessionMode: [],
        role: ''
    });

    // Stats state
    const [suggestedMatches, setSuggestedMatches] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);

    // Theme state
    const [isDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('skillnova-theme');
        return savedTheme === 'dark';
    });

    useEffect(() => {
        localStorage.setItem('skillnova-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);


    const fetchSkills = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}/skills`);
            const data = await response.json();
            setUserData(data);

            // Set initial active tab based on role
            if (data.role === 'Student') setActiveTab('learn');
            else setActiveTab('teach');
        } catch (error) {
            console.error('Error fetching skills:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const fetchDashboardData = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:5000/api/dashboard`, {
                headers: { 'x-user-id': userId }
            });
            const data = await res.json();
            setIncomingRequests(Array.isArray(data.pendingRequests) ? data.pendingRequests : []);
            setSentRequests(Array.isArray(data.sentRequests) ? data.sentRequests : []);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        }
    }, [userId]);

    const fetchMatches = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:5000/api/users/matches`, {
                headers: { 'x-user-id': userId }
            });
            const data = await res.json();
            setSuggestedMatches(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch matches", err);
        }
    }, [userId]);

    useEffect(() => {
        fetchSkills();
        fetchDashboardData();
        fetchMatches();
    }, [fetchSkills, fetchDashboardData, fetchMatches]);

    const handleSavePreferences = async (newData = userData, isSilent = false) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}/skills`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            if (response.ok) {
                // Successfully saved
                fetchSkills();
                if (!isSilent) {
                    setModalConfig({
                        title: 'Preferences Saved!',
                        message: 'Your availability and session settings have been updated successfully.',
                        type: 'success'
                    });
                    setShowModal(true);
                }
            } else {
                if (!isSilent) {
                    setModalConfig({
                        title: 'Update Failed',
                        message: 'Something went wrong while saving your preferences. Please try again.',
                        type: 'error'
                    });
                    setShowModal(true);
                }
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            if (!isSilent) {
                setModalConfig({
                    title: 'Update Failed',
                    message: 'Network error. Please check your connection and try again.',
                    type: 'error'
                });
                setShowModal(true);
            }
        }
    };

    const handleSavePrefsOnly = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/users/${userId}/preferences`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    availableDays: userData.availableDays,
                    preferredTimeSlots: userData.preferredTimeSlots,
                    sessionMode: userData.sessionMode
                })
            });

            if (response.ok) {
                setIsEditingPrefs(false);
                setModalConfig({
                    title: 'Preferences Saved!',
                    message: 'Your availability and session settings have been updated successfully.',
                    type: 'success'
                });
                setShowModal(true);
                fetchSkills();
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePreference = (field, value) => {
        if (!isEditingPrefs) return;
        const currentArr = userData[field] || [];
        const newArr = currentArr.includes(value)
            ? currentArr.filter(item => item !== value)
            : [...currentArr, value];

        const updatedData = { ...userData, [field]: newArr };
        setUserData(updatedData);
    };

    const handleAddSkill = () => setShowAddModal(true);

    const confirmAddSkill = async (skillName) => {
        const field = activeTab === 'teach' ? 'skillsToTeach' : 'skillsToLearn';
        const updatedData = {
            ...userData,
            [field]: [...userData[field], skillName]
        };

        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}/skills`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                setShowAddModal(false);
                setModalConfig({
                    title: 'Skill Added!',
                    message: `"${skillName}" has been added to your profile successfully.`,
                    type: 'success'
                });
                setShowModal(true);
                fetchSkills();
            }
        } catch (error) {
            console.error('Error adding skill:', error);
        }
    };

    const handleEditSkill = async (oldName) => {
        const newName = window.prompt(`Edit skill:`, oldName);
        if (!newName || newName === oldName) return;

        const field = activeTab === 'teach' ? 'skillsToTeach' : 'skillsToLearn';
        const updatedData = {
            ...userData,
            [field]: userData[field].map(s => s === oldName ? newName.trim() : s)
        };
        handleSavePreferences(updatedData, true);
    };

    const handleDeleteSkill = async (skillToDelete) => {
        if (!window.confirm(`Are you sure you want to remove "${skillToDelete}"?`)) return;

        const field = activeTab === 'teach' ? 'skillsToTeach' : 'skillsToLearn';
        const updatedData = {
            ...userData,
            [field]: userData[field].filter(s => s !== skillToDelete)
        };
        handleSavePreferences(updatedData, true);
    };

    // Derived skills lists for rendering
    const teachingSkills = (userData.skillsToTeach || []).map((name, idx) => {
        const stats = (userData.teachingStats || []).find(s => s.skillName.toLowerCase() === name.toLowerCase());
        return {
            id: idx,
            name,
            level: "Expert",
            experience: "Set in Profile",
            availability: (userData.availableDays || []).join(', ') || "No days set",
            sessions: stats ? stats.totalSessions : 0,
            rating: stats ? stats.averageRating : 5.0,
            demand: "Active"
        };
    });

    const learningSkills = (userData.skillsToLearn || []).map((name, idx) => ({
        id: idx + 100,
        name,
        goal: "Mastery",
        currentLevel: "Beginner",
        mentorLevel: "Expert"
    }));

    const allRequests = [...(incomingRequests || []), ...(sentRequests || [])];
    const activeSwapsCount = allRequests.filter(req => req.status === 'accepted').length;

    const stats = [
        { label: "Skills Teaching", value: (userData.skillsToTeach || []).length.toString(), icon: <GraduationCap size={20} /> },
        { label: "Skills Learning", value: (userData.skillsToLearn || []).length.toString(), icon: <BookOpen size={20} /> },
        { label: "Matches Found", value: (suggestedMatches || []).length.toString(), icon: <Handshake size={20} /> },
        { label: "Active Swaps", value: activeSwapsCount.toString(), icon: <Zap size={20} /> }
    ];

    const suggestions = [
        { name: "TypeScript", reason: "Based on your React skill", icon: <BookOpen size={20} /> },
        { name: "Node.js", reason: "Trending in Web Dev", icon: <TrendingUp size={20} /> }
    ];

    return (
        <div className={`main-dashboard ${isDarkMode ? 'dark-theme' : ''}`}>
            {/* Sidebar Reused from MainDashboard */}
            <Sidebar activeItem="skills" />

            <main className="dashboard-main">
                <div className="my-skills-container">
                    {loading && <div className="loading-overlay">Loading...</div>}

                    {/* Header */}
                    <div className="page-header-section">
                        <div className="header-text">
                            <h1>My Skills</h1>
                            <p>Your skills are your strength — share them, grow with others.</p>
                        </div>
                        <div className="header-actions-btn">
                            <button className="btn btn-primary" onClick={handleAddSkill} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>+</span> Add Skill
                            </button>
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
                        {(userData.role !== 'Student') && (
                            <button
                                className={`tab-btn ${activeTab === 'teach' ? 'active' : ''}`}
                                onClick={() => setActiveTab('teach')}
                            >
                                I Can Teach
                            </button>
                        )}
                        {(userData.role !== 'Teacher') && (
                            <button
                                className={`tab-btn ${activeTab === 'learn' ? 'active' : ''}`}
                                onClick={() => setActiveTab('learn')}
                            >
                                I Want to Learn
                            </button>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="skills-section-container">
                        {activeTab === 'teach' ? (
                            <div className="skills-content">
                                {teachingSkills.length > 0 ? (
                                    <div className="skills-grid">
                                        {teachingSkills.map(skill => (
                                            <div key={skill.id} className="professional-skill-card">
                                                <div className="skill-card-top">
                                                    <div className="skill-main-info">
                                                        <h3>{skill.name}</h3>
                                                        <div className="badge-group">
                                                            <span className="skill-badge badge-level">{skill.level}</span>
                                                            {skill.demand && <span className="skill-badge badge-demand">{skill.demand}</span>}
                                                            <span className="skill-badge badge-popular">Popular</span>
                                                        </div>
                                                    </div>
                                                    <div className="skill-icon" style={{ fontSize: '1.5rem', color: 'var(--accent-color)' }}><Laptop size={24} /></div>
                                                </div>

                                                <div className="skill-meta-grid">
                                                    <div className="meta-item">
                                                        <label>Experience</label>
                                                        <span>{skill.experience}</span>
                                                    </div>
                                                    <div className="meta-item">
                                                        <label>Availability</label>
                                                        <span>{skill.availability}</span>
                                                    </div>
                                                </div>

                                                <div className="skill-stats-footer">
                                                    <div className="rating-stars" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Star size={16} fill="currentColor" /> {skill.rating} Rating
                                                    </div>
                                                    <div className="sessions-count">
                                                        {skill.sessions} Sessions
                                                    </div>
                                                </div>

                                                <div className="card-actions">
                                                    <button className="action-btn" onClick={() => handleEditSkill(skill.name)}><Edit size={16} /> Edit</button>
                                                    <button className="action-btn"><MessageSquare size={16} /> Requests</button>
                                                    <button className="action-btn danger" onClick={() => handleDeleteSkill(skill.name)}><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState type="teaching" onAdd={handleAddSkill} />
                                )}
                            </div>
                        ) : (
                            <div className="skills-content">
                                {learningSkills.length > 0 ? (
                                    <div className="skills-grid">
                                        {learningSkills.map(skill => (
                                            <div key={skill.id} className="professional-skill-card suggestion-card">
                                                <div className="skill-card-top">
                                                    <div className="skill-main-info">
                                                        <h3>{skill.name}</h3>
                                                        <div className="badge-group">
                                                            <span className="skill-badge badge-level">Current: {skill.currentLevel}</span>
                                                        </div>
                                                    </div>
                                                    <div className="skill-icon" style={{ fontSize: '1.5rem', color: 'var(--success-color)' }}><Rocket size={24} /></div>
                                                </div>

                                                <div className="skill-meta-grid">
                                                    <div className="meta-item" style={{ gridColumn: 'span 2' }}>
                                                        <label>Learning Goal</label>
                                                        <span>{skill.goal}</span>
                                                    </div>
                                                    <div className="meta-item">
                                                        <label>Target Level</label>
                                                        <span>{skill.mentorLevel} Mentor</span>
                                                    </div>
                                                </div>

                                                <div className="card-actions" style={{ marginTop: 'auto' }}>
                                                    <button className="action-btn primary" onClick={() => navigate('/swap-progress')}>🔍 Find Matches</button>
                                                    <button className="action-btn" onClick={() => handleEditSkill(skill.name)}><Edit size={16} /> Edit</button>
                                                    <button className="action-btn danger" onClick={() => handleDeleteSkill(skill.name)}><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState type="learning" onAdd={handleAddSkill} />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Availability & Preferences */}
                    <div className="skills-section-container">
                        <div className="section-head">
                            <h2>Availability & Preferences</h2>
                            <div className="header-actions-btn" style={{ gap: '0.75rem' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setIsEditingPrefs(!isEditingPrefs)}
                                    style={{
                                        padding: '0.4rem 1.2rem',
                                        fontSize: '0.9rem',
                                        background: isEditingPrefs ? 'var(--bg-secondary)' : 'transparent',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    {isEditingPrefs ? <><Ban size={16} /> Cancel</> : <><Edit size={16} /> Edit</>}
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSavePrefsOnly}
                                    disabled={!isEditingPrefs}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        fontSize: '0.9rem',
                                        opacity: isEditingPrefs ? 1 : 0.5,
                                        cursor: isEditingPrefs ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                        <div className="availability-grid" style={{ opacity: isEditingPrefs ? 1 : 0.8 }}>
                            <div className="pref-card">
                                <div className="pref-group">
                                    <h4>Available Days</h4>
                                    <div className="days-tags">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                            <span
                                                key={day}
                                                className={`day-tag ${userData.availableDays.includes(day) ? 'selected' : ''}`}
                                                onClick={() => togglePreference('availableDays', day)}
                                                style={{
                                                    cursor: isEditingPrefs ? 'pointer' : 'not-allowed',
                                                    pointerEvents: isEditingPrefs ? 'auto' : 'none'
                                                }}
                                            >
                                                {day}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="pref-group">
                                    <h4>Preferred Time Slots</h4>
                                    <div className="days-tags">
                                        {['Morning (9-12)', 'Afternoon (1-4)', 'Evening (5-9)', 'Night (9-12)'].map(slot => (
                                            <span
                                                key={slot}
                                                className={`day-tag ${userData.preferredTimeSlots.includes(slot) ? 'selected' : ''}`}
                                                onClick={() => togglePreference('preferredTimeSlots', slot)}
                                                style={{
                                                    cursor: isEditingPrefs ? 'pointer' : 'not-allowed',
                                                    pointerEvents: isEditingPrefs ? 'auto' : 'none'
                                                }}
                                            >
                                                {slot}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="pref-card">
                                <div className="pref-group">
                                    <h4>Session Mode</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {[
                                            { id: 'Video Call', label: 'Video Call', icon: <Video size={16} /> },
                                            { id: 'Chat', label: 'Chat / Instant Messaging', icon: <MessageSquare size={16} /> },
                                            { id: 'In Person', label: 'In Person (Local Only)', icon: <MapPin size={16} /> }
                                        ].map(mode => (
                                            <label key={mode.id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                cursor: isEditingPrefs ? 'pointer' : 'not-allowed',
                                                opacity: isEditingPrefs ? 1 : 0.7
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    disabled={!isEditingPrefs}
                                                    checked={userData.sessionMode.includes(mode.id)}
                                                    onChange={() => togglePreference('sessionMode', mode.id)}
                                                />
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {mode.icon} {mode.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Smart Suggestions */}
                    <div className="skills-section-container">
                        <div className="section-head">
                            <h2>Smart Suggestions for You</h2>
                        </div>
                        <div className="skills-grid">
                            {suggestions.map((sug, idx) => (
                                <div key={idx} className="analytics-card suggestion-card" style={{ padding: '1.25rem' }}>
                                    <div className="stat-icon" style={{ background: 'rgba(217, 70, 239, 0.1)' }}>{sug.icon}</div>
                                    <div className="stat-info">
                                        <h4 style={{ color: 'var(--accent-color)' }}>Trending</h4>
                                        <span style={{ fontSize: '1.1rem' }}>{sug.name}</span>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sug.reason}</p>
                                    </div>
                                    <button className="action-btn primary" style={{ marginLeft: 'auto', padding: '0.5rem 1rem' }}>Add</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <footer className="dashboard-footer">
                    <p>© 2026 SkillSwap . Your growth, our mission.</p>
                </footer>
            </main>

            {/* Success/Error Modal */}
            <SuccessModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />

            {/* Add Skill Modal */}
            <AddSkillModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={confirmAddSkill}
                type={activeTab}
                existingSkills={[...userData.skillsToTeach, ...userData.skillsToLearn]}
            />
        </div>
    );
};

const EmptyState = ({ type, onAdd }) => (
    <div className="empty-state-container">
        <div className="empty-illustration">{type === 'teaching' ? <GraduationCap size={48} /> : <BookOpen size={48} />}</div>
        <h3>You haven’t added any skills to {type === 'teaching' ? 'teach' : 'learn'} yet.</h3>
        <p>Start by adding one skill you can teach or want to learn to connect with our community.</p>
        <button className="btn btn-primary" onClick={onAdd}>Add Your First Skill</button>
    </div>
);

export default MySkills;
