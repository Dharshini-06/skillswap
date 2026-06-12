import React, { useState, useEffect } from 'react';
import './MainDashboard.css';
import './MySkills.css';
import Sidebar from '../components/Sidebar';
import { Rocket } from 'lucide-react';

const LearningFeed = () => {
    // Theme state
    const [isDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('skillnova-theme');
        return savedTheme === 'dark';
    });

    useEffect(() => {
        localStorage.setItem('skillnova-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    return (
        <div className={`main-dashboard ${isDarkMode ? 'dark-theme' : ''}`}>
            <Sidebar activeItem="feed" />

            <main className="dashboard-main" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="my-skills-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>

                    <div className="professional-skill-card" style={{ maxWidth: '500px', textAlign: 'center', padding: '3rem 2rem', width: '100%', margin: 'auto' }}>
                        <div style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}><Rocket size={48} /></div>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                            Learning Feed – Coming Soon
                        </h2>

                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '1rem' }}>
                            This feature will be available soon.
                        </p>

                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem' }}>
                            We are working on integrating exciting community learning features.
                        </p>

                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            Stay tuned for updates!
                        </p>
                    </div>

                </div>

                <footer className="dashboard-footer">
                    <p>© 2026 SkillSwap . Your growth, our mission.</p>
                </footer>
            </main>
        </div>
    );
};

export default LearningFeed;
