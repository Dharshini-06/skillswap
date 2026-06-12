import React, { useState, useEffect } from 'react';
import './AddSkillModal.css';

const onboardingSkills = [
    { name: "Web Development", icon: "💻" },
    { name: "UI/UX Design", icon: "🎨" },
    { name: "React JS", icon: "⚛️" },
    { name: "Python", icon: "🐍" },
    { name: "Data Science", icon: "📊" },
    { name: "Digital Marketing", icon: "📱" },
    { name: "Machine Learning", icon: "🤖" },
    { name: "Cyber Security", icon: "🔒" },
    { name: "Cloud Computing", icon: "☁️" },
    { name: "App Development", icon: "📱" },
];

const AddSkillModal = ({ isOpen, onClose, onAdd, type, existingSkills = [] }) => {
    const [skillName, setSkillName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSkillName('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (skillName.trim()) {
            onAdd(skillName.trim());
        }
    };

    const handleSelectSkill = (name) => {
        setSkillName(name);
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="add-skill-modal">
                <div className="modal-header">
                    <h2>Add New Skill</h2>
                    <p>Add a skill you want to {type === 'teach' ? 'teach others' : 'learn'}.</p>
                </div>

                <div className="skills-options-grid">
                    {onboardingSkills.map((skill, index) => {
                        const isAlreadyAdded = existingSkills.some(s => s.toLowerCase() === skill.name.toLowerCase());
                        return (
                            <button
                                key={index}
                                type="button"
                                className={`skill-option-btn ${skillName === skill.name ? 'selected' : ''}`}
                                onClick={() => handleSelectSkill(skill.name)}
                                disabled={isAlreadyAdded}
                                title={isAlreadyAdded ? "Skill already added" : ""}
                            >
                                <span>{skill.icon}</span>
                                <span>{skill.name}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="or-divider">OR</div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                            Type custom skill
                        </label>
                        <input
                            type="text"
                            placeholder="Skill Name (e.g. Graphic Design)"
                            value={skillName}
                            onChange={(e) => setSkillName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-add" disabled={!skillName.trim()}>
                            Add Skill
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSkillModal;
