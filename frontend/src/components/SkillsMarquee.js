import React from "react";
import "./SkillsMarquee.css";

const skills = [
    { name: "Web Development", icon: "💻" },
    { name: "UI/UX Design", icon: "🎨" },
    { name: "Guitar", icon: "🎸" },
    { name: "Photography", icon: "📷" },
    { name: "Spanish", icon: "🇪🇸" },
    { name: "Yoga", icon: "🧘" },
    { name: "React", icon: "⚛️" },
    { name: "Python", icon: "🐍" },
    { name: "Digital Marketing", icon: "📱" },
    { name: "Cooking", icon: "🍳" },
    { name: "Video Editing", icon: "🎬" },
    { name: "Public Speaking", icon: "🎙️" },
];

export default function SkillsMarquee() {
    return (
        <div className="marquee-container" aria-hidden="true">
            <div className="marquee-wrapper">
                {/* We need two sets of items for seamless looping */}
                <div className="marquee-track">
                    {skills.map((skill, index) => (
                        <div key={`s1-${index}`} className="marquee-item glass-pill">
                            <span className="icon">{skill.icon}</span>
                            <span className="text">{skill.name}</span>
                        </div>
                    ))}
                    {/* Duplicate for infinite effect */}
                    {skills.map((skill, index) => (
                        <div key={`s2-${index}`} className="marquee-item glass-pill">
                            <span className="icon">{skill.icon}</span>
                            <span className="text">{skill.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
