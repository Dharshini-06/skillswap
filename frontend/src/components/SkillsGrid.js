import React from "react";
import "./SkillsGrid.css";

const skills = [
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

export default function SkillsGrid() {
    return (
        <section className="skills-grid-section" aria-label="Popular Skills">
            <h3 className="skills-title">Popular Skills to Learn</h3>
            <div className="skills-grid-container">
                {skills.map((skill, index) => (
                    <div key={index} className="skill-card">
                        <span className="skill-icon">{skill.icon}</span>
                        <span className="skill-name">{skill.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
