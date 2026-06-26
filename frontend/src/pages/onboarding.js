import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./Onboarding.css";
import logo from "../assets/logo.svg";

const countries = [
    "United States", "United Kingdom", "India", "Canada", "Australia",
    "Germany", "France", "Singapore", "Japan", "Other"
];

const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year"];

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

export default function Onboarding() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const userId = localStorage.getItem("userId");

    const [formData, setFormData] = useState({
        role: "",
        fieldOfSpecialization: "",
        institution: "",
        experienceOrYear: "",
        resume: null,
        country: "",
        bio: "",
        skillToLearn: "",
        skillToTeach: "",
        experienceDetails: ""
    });

    useEffect(() => {
        if (!userId) {
            navigate("/login");
        }
    }, [userId, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, resume: e.target.files[0] }));
    };

    const nextStep = () => {
        setCurrentStep((prev) => prev + 1);
    };

    const prevStep = () => {
        setCurrentStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);

        const { resume, ...restOfData } = formData;
        const payload = {
            userId,
            ...restOfData,
            // Ensure skills are sent as arrays at the top level
            skillsToLearn: formData.skillToLearn ? formData.skillToLearn.split(',').map(s => s.trim()).filter(Boolean) : [],
            skillsToTeach: formData.skillToTeach ? formData.skillToTeach.split(',').map(s => s.trim()).filter(Boolean) : [],
        };

        // Debugging log to verify payload structure
        console.log("Submitting Onboarding Payload:", payload);

        try {
            const response = await fetch("https://://skillswap-ekvn.onrender.com/api/auth/complete-onboarding", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Onboarding successful:", result);

                localStorage.setItem("onboardingCompleted", "true");
                localStorage.setItem("userRole", formData.role);
                localStorage.setItem("userCountry", formData.country);
                localStorage.setItem("userBio", formData.bio);
                // The remaining fields can stay as they are for local reference
                localStorage.setItem("userSkillToLearn", formData.skillToLearn);
                localStorage.setItem("userSkillToTeach", formData.skillToTeach);

                navigate("/dashboard");
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to save onboarding data");
            }
        } catch (error) {
            console.error("Onboarding error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Animation variants
    const slideVariants = {
        enter: (direction) => ({
            y: direction > 0 ? 30 : -30,
            opacity: 0,
            scale: 0.98
        }),
        center: {
            zIndex: 1,
            y: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            y: direction < 0 ? 30 : -30,
            opacity: 0,
            scale: 0.98
        })
    };

    const [[step, direction], setStepDirection] = useState([1, 0]);

    const paginate = (newStep) => {
        const dir = newStep > currentStep ? 1 : -1;
        setCurrentStep(newStep);
        setStepDirection([newStep, dir]);
    };

    const totalSteps = 6;

    return (
        <div className="onboarding-wrapper">
            {/* Settle (Subtle) 3D Background */}
            <div className="settle-3d-grid" aria-hidden="true"></div>

            {/* Very Subtle Ambient Depth Glow */}
            <div className="ambient-depth-glow" aria-hidden="true">
                <div className="glow-blob b1"></div>
                <div className="glow-blob b2"></div>
                <div className="glow-blob b3"></div>
            </div>

            {/* Light Background Sweep */}
            <div className="background-sweep" aria-hidden="true"></div>

            <header
                className="site-header"
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                onClick={() => navigate('/')}
            >
                <img src={logo} alt="SkillSwap logo" className="brand-logo-circle" />
            </header>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="onboarding-card"
            >
                <div className="progress-bar-container">
                    <motion.div
                        className="progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>
                <div className="step-indicator">
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                        <div
                            key={s}
                            className={`step-dot ${s === currentStep ? "active" : ""} ${s < currentStep ? "completed" : ""}`}
                        ></div>
                    ))}
                </div>

                <div className="onboarding-content">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                opacity: { duration: 0.4, ease: "easeInOut" }
                            }}
                        >
                            {currentStep === 1 && (
                                <div className="step-content">
                                    <h2 className="question-label">First, tell us who you are</h2>
                                    <div className="option-grid">
                                        <div
                                            className={`option-card ${formData.role === "Student" ? "selected" : ""}`}
                                            onClick={() => setFormData({ ...formData, role: "Student" })}
                                        >
                                            <span className="option-icon">🎓</span>
                                            <span className="option-title">Student</span>
                                            <span className="option-desc">I am currently learning</span>
                                        </div>
                                        <div
                                            className={`option-card ${formData.role === "Teacher" ? "selected" : ""}`}
                                            onClick={() => setFormData({ ...formData, role: "Teacher" })}
                                        >
                                            <span className="option-icon">👨‍🏫</span>
                                            <span className="option-title">Teacher</span>
                                            <span className="option-desc">I love to share knowledge</span>
                                        </div>
                                        <div
                                            className={`option-card ${formData.role === "Skillswapper" ? "selected" : ""}`}
                                            onClick={() => setFormData({ ...formData, role: "Skillswapper" })}
                                        >
                                            <span className="option-icon">🔄</span>
                                            <span className="option-title">Skillswapper</span>
                                            <span className="option-desc">Let's trade skills</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="step-content">
                                    <h2 className="question-label">
                                        {formData.role === "Skillswapper"
                                            ? "What course would you like to learn?"
                                            : (formData.role === "Student" ? "What are you studying?" : "What is your specialization?")}
                                    </h2>
                                    {formData.role === "Skillswapper" ? (
                                        <div className="skills-grid-selection">
                                            {skills.map((skill, index) => (
                                                <div
                                                    key={index}
                                                    className={`skill-item ${formData.skillToLearn === skill.name ? "selected" : ""}`}
                                                    onClick={() => setFormData({ ...formData, skillToLearn: skill.name })}
                                                >
                                                    <span>{skill.icon}</span>
                                                    <span>{skill.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            name="fieldOfSpecialization"
                                            className="onboarding-input"
                                            placeholder={formData.role === "Student" ? "e.g. Computer Science" : "e.g. FullStack Development"}
                                            autoFocus
                                            value={formData.fieldOfSpecialization}
                                            onChange={handleChange}
                                        />
                                    )}
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="step-content">
                                    <h2 className="question-label">
                                        {formData.role === "Skillswapper"
                                            ? "What course will you teach in return?"
                                            : "Which Institution are you from?"}
                                    </h2>
                                    {formData.role === "Skillswapper" ? (
                                        <input
                                            type="text"
                                            name="skillToTeach"
                                            className="onboarding-input"
                                            placeholder="e.g. Node.js or Graphic Design"
                                            autoFocus
                                            value={formData.skillToTeach}
                                            onChange={(e) => setFormData({ ...formData, skillToTeach: e.target.value })}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            name="institution"
                                            className="onboarding-input"
                                            placeholder="e.g. IIT Madras / Stanford"
                                            autoFocus
                                            value={formData.institution}
                                            onChange={handleChange}
                                        />
                                    )}
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="step-content">
                                    <h2 className="question-label">
                                        {formData.role === "Skillswapper"
                                            ? "Your Experience & Proof"
                                            : (formData.role === "Student" ? "Current year & Portfolio" : "Experience & Portfolio")}
                                    </h2>
                                    {formData.role === "Skillswapper" ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <input
                                                type="text"
                                                name="experienceDetails"
                                                className="onboarding-input"
                                                placeholder="Total years of experience..."
                                                value={formData.experienceDetails}
                                                onChange={(e) => setFormData({ ...formData, experienceDetails: e.target.value })}
                                            />
                                            <label className="file-dropzone">
                                                <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                                                <div className="file-icon">📜</div>
                                                <p style={{ color: '#fff', marginBottom: '0.5rem' }}>
                                                    {formData.resume ? formData.resume.name : "Upload Certification/Proof (PDF)"}
                                                </p>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Optional but helpful</p>
                                            </label>
                                        </div>
                                    ) : (
                                        <>
                                            {formData.role === "Student" ? (
                                                <select
                                                    name="experienceOrYear"
                                                    className="onboarding-select"
                                                    value={formData.experienceOrYear}
                                                    onChange={handleChange}
                                                >
                                                    <option value="" disabled>Select Year</option>
                                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    name="experienceOrYear"
                                                    className="onboarding-input"
                                                    placeholder="e.g. 5+ years of experience"
                                                    value={formData.experienceOrYear}
                                                    onChange={handleChange}
                                                />
                                            )}
                                            <label className="file-dropzone">
                                                <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                                                <div className="file-icon">📄</div>
                                                <p style={{ color: '#fff', marginBottom: '0.5rem' }}>
                                                    {formData.resume ? formData.resume.name : "Upload Resume/Portfolio (PDF)"}
                                                </p>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Optional but recommended</p>
                                            </label>
                                        </>
                                    )}
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="step-content">
                                    <h2 className="question-label">Where are you located?</h2>
                                    <select
                                        name="country"
                                        className="onboarding-select"
                                        value={formData.country}
                                        onChange={handleChange}
                                    >
                                        <option value="" disabled>Select Country</option>
                                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            )}

                            {currentStep === 6 && (
                                <div className="step-content">
                                    <h2 className="question-label">Lastly, tell us a bit about yourself</h2>
                                    <textarea
                                        name="bio"
                                        className="onboarding-textarea"
                                        placeholder="Your skills, interests, or what you hope to learn..."
                                        value={formData.bio}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="controls">
                    {currentStep > 1 && (
                        <button className="btn-back" onClick={prevStep}>Back</button>
                    )}

                    {currentStep < 6 ? (
                        <button
                            className="btn-next"
                            onClick={nextStep}
                            disabled={
                                (currentStep === 1 && !formData.role) ||
                                (currentStep === 2 && (formData.role === "Skillswapper" ? !formData.skillToLearn : !formData.fieldOfSpecialization)) ||
                                (currentStep === 3 && (formData.role === "Skillswapper" ? !formData.skillToTeach : !formData.institution)) ||
                                (currentStep === 5 && !formData.country)
                            }
                        >
                            Continue <span>→</span>
                        </button>
                    ) : (
                        <button
                            className="btn-next"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Setting up..." : "Finish & Go to Dashboard"} <span>🚀</span>
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
