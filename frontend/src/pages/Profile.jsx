import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles, CheckCircle, RefreshCw, Check, Circle, PenLine, Palette, FileText } from 'lucide-react';
import './Profile.css';
import './MainDashboard.css';
import Sidebar from '../components/Sidebar';

const Profile = () => {
    const navigate = useNavigate();
    const [isDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('skillnova-theme');
        return savedTheme === 'dark';
    });

    useEffect(() => {
        // persist theme choice so app-wide toggle stays in sync
        localStorage.setItem('skillnova-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);


    const userId = localStorage.getItem('userId');

    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        role: '',
        country: '',
        bio: '',
        specialization: '',
        institution: '',
        experience: '',
        resume: '',
        github: '',
        linkedin: '',
        portfolio: '',
        interests: '',
        profileType: 'avatar',
        avatarUrl: '',
        profileImage: '',
        teachingStats: [],
        skillsToTeach: '',
        skillsToLearn: '',
    });
    const [activities, setActivities] = useState([]);
    const [originalProfile, setOriginalProfile] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);

    useEffect(() => {
        async function fetchProfile() {
            if (!userId) {
                return;
            }
            try {
                const res = await fetch(`http://https://skillswap-ekvn.onrender.com/api/profile/${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setProfile(prev => ({ ...prev, ...data }));
                    // Populate localStorage for backward compatibility/Dashboard greeting
                    localStorage.setItem('userName', data.name || '');
                    localStorage.setItem('userRole', data.role || '');
                    localStorage.setItem('userCountry', data.country || '');
                    localStorage.setItem('userBio', data.bio || '');
                    localStorage.setItem('userInstitution', data.institution || '');
                    localStorage.setItem('userSpecialization', data.specialization || '');
                    localStorage.setItem('userExperience', data.experience || '');
                    localStorage.setItem('userResumeUploaded', data.resume ? 'true' : 'false');
                    localStorage.setItem('userProfileType', data.profileType || 'avatar');
                    localStorage.setItem('userAvatarUrl', data.avatarUrl || '');
                    localStorage.setItem('userProfileImage', data.profileImage || '');
                }
            } catch (err) {
                console.error('Failed to fetch profile', err);
            }
        }
        async function fetchActivities() {
            try {
                const res = await fetch(`http://https://skillswap-ekvn.onrender.com/api/user`, {
                    headers: { 'x-user-id': userId }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Filter or map to recent activity
                    setActivities(data.slice(0, 4)); // Last 4 swaps
                }
            } catch (err) {
                console.error('Failed to fetch activities', err);
            }
        }
        fetchProfile();
        fetchActivities();
    }, [userId]);

    // Derived values for display logic
    const displayRole = profile.role || localStorage.getItem('userRole');
    const displayBio = profile.bio || localStorage.getItem('userBio');
    const displayCountry = profile.country || localStorage.getItem('userCountry');
    const displayName = profile.name || localStorage.getItem('userName');
    const displayEmail = profile.email || localStorage.getItem('userEmail');

    // Education details should come from Onboarding (single source of truth)
    const eduInstitution = localStorage.getItem('userInstitution') || '';
    const eduSpecialization = localStorage.getItem('userSpecialization') || '';
    const eduExperience = localStorage.getItem('userExperience') || '';

    // Helper for Links card

    const handleGenerateAvatar = () => {
        const seed = profile.name.toLowerCase().replace(/\s+/g, '') || 'user';
        const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
        setProfile({ ...profile, avatarUrl: url, profileType: 'avatar' });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            setProfile({ ...profile, profileType: 'image' });
        }
    };


    return (
        <div className={`main-dashboard ${isDarkMode ? 'dark-theme' : ''}`}>
            <Sidebar activeItem="profile" />

            <main className="dashboard-main">
                <header className="dashboard-header profile-header">
                    <div className="header-left">
                        <h2 className="profile-title">My Profile</h2>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                            Back to Dashboard
                        </button>
                        {isEditing ? (
                            <>
                                <button className="btn btn-primary" style={{ marginLeft: '12px' }} onClick={async () => {
                                    // Save
                                    try {
                                        const form = new FormData();
                                        form.append('name', profile.name || '');
                                        form.append('role', profile.role || '');
                                        form.append('country', profile.country || '');
                                        form.append('bio', profile.bio || '');
                                        form.append('institution', profile.institution || '');
                                        form.append('specialization', profile.specialization || '');
                                        form.append('experience', profile.experience || '');
                                        // New optional fields
                                        form.append('github', profile.github || '');
                                        form.append('linkedin', profile.linkedin || '');
                                        form.append('portfolio', profile.portfolio || '');
                                        form.append('interests', profile.interests || '');
                                        form.append('profileType', profile.profileType || 'avatar');
                                        form.append('avatarUrl', profile.avatarUrl || '');
                                        form.append('skillsToTeach', profile.skillsToTeach || '');
                                        form.append('skillsToLearn', profile.skillsToLearn || '');

                                        if (resumeFile) form.append('resume', resumeFile);
                                        if (profileImageFile) form.append('profileImage', profileImageFile);

                                        const res = await fetch(`http://https://skillswap-ekvn.onrender.com/api/profile/${userId}`, {
                                            method: 'PUT',
                                            body: form
                                        });
                                        if (res.ok) {
                                            // refresh
                                            const refreshed = await (await fetch(`http://https://skillswap-ekvn.onrender.com/api/profile/${userId}`)).json();
                                            setProfile(prev => ({ ...prev, ...refreshed }));
                                            // update localStorage
                                            localStorage.setItem('userName', refreshed.name || '');
                                            localStorage.setItem('userRole', refreshed.role || '');
                                            localStorage.setItem('userCountry', refreshed.country || '');
                                            localStorage.setItem('userBio', refreshed.bio || '');
                                            localStorage.setItem('userInstitution', refreshed.institution || '');
                                            localStorage.setItem('userSpecialization', refreshed.specialization || '');
                                            localStorage.setItem('userExperience', refreshed.experience || '');
                                            localStorage.setItem('userResumeUploaded', refreshed.resume ? 'true' : 'false');
                                            localStorage.setItem('userProfileType', refreshed.profileType || 'avatar');
                                            localStorage.setItem('userAvatarUrl', refreshed.avatarUrl || '');
                                            localStorage.setItem('userProfileImage', refreshed.profileImage || '');
                                            setIsEditing(false);
                                            setResumeFile(null);
                                            setProfileImageFile(null);
                                            setOriginalProfile(null);
                                        } else {
                                            console.error('Failed to save profile');
                                            alert('Failed to save profile');
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert('Error saving profile');
                                    }
                                }}>Save Changes</button>
                                <button className="btn btn-outline" style={{ marginLeft: '8px' }} onClick={() => {
                                    if (originalProfile) setProfile(originalProfile);
                                    setIsEditing(false);
                                    setResumeFile(null);
                                    setOriginalProfile(null);
                                }}>Cancel</button>
                            </>
                        ) : (
                            <button className="btn btn-primary" style={{ marginLeft: '12px' }} onClick={() => {
                                setOriginalProfile(profile);
                                setIsEditing(true);
                            }}>Edit Profile</button>
                        )}
                    </div>
                </header>

                <section className="dashboard-content profile-layout">
                    <div className="content-left">
                        <div className="profile-card profile-picture-card">
                            <h3>Profile Picture</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1rem' }}>
                                <div className="profile-image-preview">
                                    {(profile.profileType === 'image' && (profileImageFile || profile.profileImage)) ? (
                                        <img src={profileImageFile ? URL.createObjectURL(profileImageFile) : `http://https://skillswap-ekvn.onrender.com${profile.profileImage}`} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', background: 'var(--bg-secondary)', border: '2px solid var(--accent-color)' }} />
                                    ) : (
                                        <img src={profile.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.name || 'user'}`} alt="Avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--accent-color)' }} />
                                    )}
                                </div>
                                {isEditing && (
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Upload size={18} /> Upload Image
                                            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                        </label>
                                        <span style={{ alignSelf: 'center', color: 'var(--text-secondary)' }}>OR</span>
                                        <button className="btn btn-outline" onClick={handleGenerateAvatar} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Sparkles size={18} /> Generate Avatar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="profile-card basic-details">
                            <h3>Basic Details</h3>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <label>Full Name</label>
                                    {isEditing ? (
                                        <input className="profile-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                                    ) : (
                                        <p>{displayName || 'Not provided'}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>Email Address</label>
                                    <p>{displayEmail || 'Not provided'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Primary Role</label>
                                    {isEditing ? (
                                        <input className="profile-input" value={profile.role} onChange={e => setProfile({ ...profile, role: e.target.value })} />
                                    ) : (
                                        <p>{displayRole || 'Not provided'}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>Country</label>
                                    {isEditing ? (
                                        <input className="profile-input" value={profile.country} onChange={e => setProfile({ ...profile, country: e.target.value })} />
                                    ) : (
                                        <p>{displayCountry || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="profile-card education-details">
                            <h3>{displayRole === "Student" ? "Education Details" : (displayRole === "Skillswap Person" ? "Experience Details" : "Professional Details")}</h3>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <label>{displayRole === "Student" ? "College / Institution" : "Current Company / Institution"}</label>
                                    {isEditing ? (
                                        <input className="profile-input" value={profile.institution} onChange={e => setProfile({ ...profile, institution: e.target.value })} />
                                    ) : (
                                        <p>{eduInstitution || 'Not provided'}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{displayRole === "Student" ? "Course / Department" : "Current Profession"}</label>
                                    {isEditing ? (
                                        <input className="profile-input" value={profile.specialization} onChange={e => setProfile({ ...profile, specialization: e.target.value })} />
                                    ) : (
                                        <p>{eduSpecialization || 'Not provided'}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>{displayRole === "Student" ? "Year of Study" : "Years of Experience"}</label>
                                    {isEditing ? (
                                        <input className="profile-input" value={profile.experience} onChange={e => setProfile({ ...profile, experience: e.target.value })} />
                                    ) : (
                                        <p>{eduExperience || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="profile-card skills-summary-card">
                            <h3>Skills Summary</h3>
                            {isEditing ? (
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <label>Skills I Teach (comma separated)</label>
                                        <textarea className="profile-textarea" value={profile.skillsToTeach} onChange={e => setProfile({ ...profile, skillsToTeach: e.target.value })} />
                                    </div>
                                    <div className="detail-item">
                                        <label>Skills I Learn (comma separated)</label>
                                        <textarea className="profile-textarea" value={profile.skillsToLearn} onChange={e => setProfile({ ...profile, skillsToLearn: e.target.value })} />
                                    </div>
                                </div>
                            ) : (
                                <div className="skills-summary-grid">
                                    <div className="summary-col">
                                        <h4>Skills I Teach</h4>
                                        <div className="skill-tags">
                                            {(profile.skillsToTeach || '').split(',').filter(Boolean).map((s, i) => (
                                                <span key={i} className="skill-badge badge-popular">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="summary-col">
                                        <h4>Skills I Learn</h4>
                                        <div className="skill-tags">
                                            {(profile.skillsToLearn || '').split(',').filter(Boolean).map((s, i) => (
                                                <span key={i} className="skill-badge badge-level">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="profile-card activity-card">
                            <h3>Recent Activity</h3>
                            <div className="activity-list">
                                {activities.length > 0 ? activities.map((act, i) => {
                                    const offered = act.skillsOffered?.[0] || "";
                                    const wanted = act.skillsWanted?.[0] || "";
                                    const skillText = offered && wanted ? `${offered} ↔ ${wanted}` : "Skill Swap";

                                    return (
                                        <div key={i} className="activity-item">
                                            <div className="activity-icon">
                                                {act.status === 'completed' ? <CheckCircle size={20} color="var(--success-color)" /> : <RefreshCw size={20} className="spin-icon" />}
                                            </div>
                                            <div className="activity-content">
                                                <p><b>{skillText}</b> swap with <b>{act.receiver?.name === profile.name ? act.sender?.name : act.receiver?.name}</b></p>
                                                <span>{act.status.toUpperCase()} • {act.completedSessions}/{act.totalSessions || 10} Sessions</span>
                                            </div>
                                        </div>
                                    );
                                }) : <p className="not-provided">No recent activity found.</p>}
                            </div>
                        </div>

                        <div className="profile-card links-card">
                            <h3>External Links</h3>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <label>LinkedIn Profile</label>
                                    {isEditing ? (
                                        <input className="profile-input" value={profile.linkedin} onChange={e => setProfile({ ...profile, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
                                    ) : (
                                        profile.linkedin ? <a href={profile.linkedin} target="_blank" rel="noreferrer" className="link-text">{profile.linkedin}</a> : <p>Not provided</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>GitHub</label>
                                    {isEditing ? (
                                        <input className="profile-input" value={profile.github} onChange={e => setProfile({ ...profile, github: e.target.value })} placeholder="https://github.com/..." />
                                    ) : (
                                        profile.github ? <a href={profile.github} target="_blank" rel="noreferrer" className="link-text">{profile.github}</a> : <p>Not provided</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>Portfolio / Website</label>
                                    {isEditing ? (
                                        <input className="profile-input" value={profile.portfolio} onChange={e => setProfile({ ...profile, portfolio: e.target.value })} placeholder="https://..." />
                                    ) : (
                                        profile.portfolio ? <a href={profile.portfolio} target="_blank" rel="noreferrer" className="link-text">{profile.portfolio}</a> : <p>Not provided</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="right-panel">
                        {(() => {
                            const steps = [
                                { label: 'Add a Bio', done: !!profile.bio },
                                { label: 'List your Skills', done: !!profile.skillsToTeach || !!profile.skillsToLearn },
                                { label: 'Upload a Resume', done: !!profile.resume },
                                { label: 'Add Profile Photo', done: !!profile.profileImage || !!profile.avatarUrl },
                            ];
                            const completed = steps.filter(s => s.done).length;
                            const pct = (completed / steps.length) * 100;
                            return (
                                <div className="profile-card completion-card">
                                    <h3>Profile Completion</h3>
                                    <div className="completion-bar-container">
                                        <div className="completion-bar" style={{ width: `${pct}%` }}></div>
                                    </div>
                                    <div className="checklist">
                                        {steps.map((s, i) => (
                                            <div key={i} className={`checklist-item ${s.done ? 'done' : ''}`}>
                                                <span className="checklist-icon">{s.done ? <Check size={16} color="var(--success-color)" /> : <Circle size={16} />}</span>
                                                <span>{s.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        Complete your profile to increase your matching chances by 3x!
                                    </p>
                                </div>
                            );
                        })()}

                        <div className="profile-card bio-card">
                            <h3>Bio</h3>
                            {isEditing ? (
                                <textarea className="profile-textarea" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
                            ) : (
                                profile.bio ? <p className="bio-text">{displayBio}</p> : (
                                    <button className="empty-add-btn" onClick={() => setIsEditing(true)}>
                                        <PenLine size={20} />
                                        <span>Add Professional Bio</span>
                                    </button>
                                )
                            )}
                        </div>

                        <div className="profile-card interests-card">
                            <h3>Interests & Goals</h3>
                            {isEditing ? (
                                <textarea className="profile-textarea" value={profile.interests} onChange={e => setProfile({ ...profile, interests: e.target.value })} placeholder="e.g. Open Source, AI Research, Mentorship..." />
                            ) : (
                                profile.interests ? <p className="bio-text">{profile.interests}</p> : (
                                    <button className="empty-add-btn" onClick={() => setIsEditing(true)}>
                                        <Palette size={20} />
                                        <span>Add Interests & Goals</span>
                                    </button>
                                )
                            )}
                        </div>

                        <div className="profile-card resume-card">
                            <h3>Resume</h3>
                            {isEditing ? (
                                <div>
                                    <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={e => setResumeFile(e.target.files[0])} />
                                    <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>{resumeFile ? resumeFile.name : (profile.resume ? 'Resume uploaded' : 'No resume uploaded')}</p>
                                </div>
                            ) : (
                                profile.resume || localStorage.getItem('userResumeUploaded') === 'true' ? (
                                    <div className="resume-status">
                                        <FileText size={20} />
                                        <p>Resume uploaded</p>
                                        <a className="btn btn-outline" style={{ width: '100%', display: 'inline-block', marginTop: '1rem' }} href={`http://https://skillswap-ekvn.onrender.com${profile.resume}`} target="_blank" rel="noreferrer">View / Download</a>
                                    </div>
                                ) : (
                                    <button className="empty-add-btn" onClick={() => setIsEditing(true)}>
                                        <FileText size={20} />
                                        <span>Upload Your Resume</span>
                                    </button>
                                )
                            )}
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
};

export default Profile;
