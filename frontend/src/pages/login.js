/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./landing.css";
import logo from "../assets/logo.svg";
import Footer from "../components/Footer";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // UX: Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("user", JSON.stringify({ _id: data.userId, name: data.name || "User" }));
        localStorage.setItem("onboardingCompleted", data.onboardingCompleted);

        setIsSuccess(true);
        // Delay navigation to show success message
        setTimeout(() => {
          if (data.onboardingCompleted) {
            navigate(redirectPath || "/dashboard");
          } else {
            navigate("/onboarding");
          }
        }, 2500);
      } else {
        alert(data.message || "Login failed");
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
        {/* LEFT: content aligned with landing page style */}
        <section className="left" aria-label="Welcome Back">
          <h1 className="title" style={{ fontSize: "5rem" }}>
            Welcome Back
          </h1>
          <p className="tagline">
            Your journey of exponential growth continues here. Log in to reconnect with your mentors and continue swapping skills.
          </p>

          <div className="social-proof-micro" style={{ marginTop: '2rem' }}>
            <div className="avatar-stack">
              <div className="avatar av-1"></div>
              <div className="avatar av-2"></div>
              <div className="avatar av-3"></div>
              <div className="avatar av-4"></div>
              <div className="avatar-count">+1.2k</div>
            </div>
            <p className="social-text">Rejoining a community of serious practitioners.</p>
          </div>
        </section>

        {/* RIGHT: Login Form styled like the landing page visual block */}
        <aside className="right">
          <div className="how-it-works-block" style={{ padding: '3rem', maxWidth: '460px', animation: 'none' }}>
            {!isSuccess ? (
              <>
                <div style={{ marginBottom: "2rem" }}>
                  <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white", marginBottom: "0.5rem" }}>
                    Sign In
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                    Enter your credentials to access your account
                  </p>
                </div>

                <form onSubmit={handleLogin}>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", color: "#e2e8f0", fontSize: "0.875rem", marginBottom: "0.6rem", fontWeight: "600" }}>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      style={{
                        width: "100%",
                        padding: "1rem",
                        borderRadius: "14px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        background: "rgba(255, 255, 255, 0.03)",
                        color: "white",
                        fontSize: "1rem",
                        transition: "all 0.3s"
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "2rem" }}>
                    <label style={{ display: "block", color: "#e2e8f0", fontSize: "0.875rem", marginBottom: "0.6rem", fontWeight: "600" }}>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: "100%",
                        padding: "1rem",
                        borderRadius: "14px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        background: "rgba(255, 255, 255, 0.03)",
                        color: "white",
                        fontSize: "1rem",
                        transition: "all 0.3s"
                      }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: '1.1rem', borderRadius: '14px' }}>
                    Sign In to SkillSwap
                  </button>
                </form>

                <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                  New to SkillSwap?
                  <span
                    onClick={() => navigate('/register')}
                    style={{
                      color: "var(--accent)",
                      cursor: "pointer",
                      marginLeft: "8px",
                      fontWeight: "700",
                      textDecoration: "underline"
                    }}
                  >
                    Create account
                  </span>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>👋</div>
                <h2 style={{ color: "white", fontSize: "2rem", fontWeight: "800", marginBottom: "1rem" }}>Welcome Back!</h2>
                <div style={{
                  padding: "1.5rem",
                  background: "rgba(124, 58, 237, 0.1)",
                  borderRadius: "20px",
                  border: "1px solid rgba(124, 58, 237, 0.2)",
                  color: "#e2e8f0",
                  fontStyle: "italic",
                  lineHeight: "1.6"
                }}>
                  "Every master was once a beginner. Ready to swap some more skills today?"
                </div>
                <p style={{ marginTop: "2.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  Taking you to your dashboard...
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
