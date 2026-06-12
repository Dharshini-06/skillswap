/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./landing.css";
import logo from "../assets/logo.svg";
import Footer from "../components/Footer";

export default function Register() {
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [isSuccess, setIsSuccess] = useState(false);

    // UX: Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Registration successful:", data);
                localStorage.setItem("userId", data.userId);
                localStorage.setItem("user", JSON.stringify({ _id: data.userId, name: formData.name }));
                localStorage.setItem("onboardingCompleted", data.onboardingCompleted);
                setIsSuccess(true);

                // Delay navigation to show success message
                setTimeout(() => {
                    navigate("/onboarding");
                }, 3000);
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Error connecting to server:", error);
            alert("Server error. Please try again later.");
        }
    };

    return (
        <div className="landing-wrapper">
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

            {/* Top-left header with logo, clickable to go home */}
            <header
                className="site-header"
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                onClick={() => navigate('/')}
            >
                <img src={logo} alt="" className="brand-logo-circle" />
                <span className="brand-name">SkillSwap</span>
            </header>

            <main className="landing">
                {/* LEFT: Branding content aligned with landing page */}
                <section className="left" aria-label="Join SkillSwap">
                    <h1 className="title" style={{ fontSize: "5rem" }}>
                        Join the Core
                    </h1>
                    <p className="tagline">
                        Become part of a global ecosystem where knowledge is the true currency. Start your journey of mutual growth today.
                    </p>

                    <div className="social-proof-micro" style={{ marginTop: '2rem' }}>
                        <div className="avatar-stack">
                            <div className="avatar av-1"></div>
                            <div className="avatar av-2"></div>
                            <div className="avatar av-3"></div>
                            <div className="avatar av-4"></div>
                            <div className="avatar-count">+1.2k</div>
                        </div>
                        <p className="social-text">1,200+ mentors waiting to match with you.</p>
                    </div>
                </section>

                {/* RIGHT: Register Form styled like how-it-works block */}
                <aside className="right">
                    <div className="how-it-works-block" style={{ padding: '2.5rem', maxWidth: '480px', animation: 'none' }}>
                        {!isSuccess ? (
                            <>
                                <div style={{ marginBottom: "1.5rem" }}>
                                    <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white", marginBottom: "0.5rem" }}>
                                        Create Account
                                    </h3>
                                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                                        Fill in your details to start swapping skills
                                    </p>
                                </div>

                                <form onSubmit={handleRegister}>
                                    <div style={{ marginBottom: "1rem" }}>
                                        <label style={{ display: "block", color: "#e2e8f0", fontSize: "0.85rem", marginBottom: "0.5rem", fontWeight: "600" }}>Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            required
                                            style={{
                                                width: "100%",
                                                padding: "0.9rem",
                                                borderRadius: "12px",
                                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                                background: "rgba(255, 255, 255, 0.03)",
                                                color: "white",
                                                fontSize: "0.95rem"
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: "1rem" }}>
                                        <label style={{ display: "block", color: "#e2e8f0", fontSize: "0.85rem", marginBottom: "0.5rem", fontWeight: "600" }}>Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            required
                                            style={{
                                                width: "100%",
                                                padding: "0.9rem",
                                                borderRadius: "12px",
                                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                                background: "rgba(255, 255, 255, 0.03)",
                                                color: "white",
                                                fontSize: "0.95rem"
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: "1.5rem" }}>
                                        <label style={{ display: "block", color: "#e2e8f0", fontSize: "0.85rem", marginBottom: "0.5rem", fontWeight: "600" }}>Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            style={{
                                                width: "100%",
                                                padding: "0.9rem",
                                                borderRadius: "12px",
                                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                                background: "rgba(255, 255, 255, 0.03)",
                                                color: "white",
                                                fontSize: "0.95rem"
                                            }}
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: '1rem', borderRadius: '12px' }}>
                                        Join SkillSwap Now
                                    </button>
                                </form>

                                <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                                    Already have an account?
                                    <span
                                        onClick={() => navigate('/login')}
                                        style={{
                                            color: "var(--accent)",
                                            cursor: "pointer",
                                            marginLeft: "8px",
                                            fontWeight: "700"
                                        }}
                                    >
                                        Sign In
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: "center", padding: "1rem" }}>
                                <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🎯</div>
                                <h2 style={{ color: "white", fontSize: "1.75rem", fontWeight: "800", marginBottom: "1rem" }}>Registration Successful!</h2>
                                <div style={{
                                    padding: "1.25rem",
                                    background: "rgba(34, 197, 94, 0.1)",
                                    borderRadius: "16px",
                                    border: "1px solid rgba(34, 197, 94, 0.2)",
                                    color: "#e2e8f0",
                                    fontStyle: "italic",
                                    lineHeight: "1.6",
                                    fontSize: "0.95rem"
                                }}>
                                    "The best way to learn is to teach. Welcome to the community where knowledge has no boundaries."
                                </div>
                                <p style={{ marginTop: "2rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                    Taking you to onboarding...
                                </p>
                            </div>
                        )}
                    </div>
                </aside>
            </main>

            <Footer />
        </div>
    );
}
