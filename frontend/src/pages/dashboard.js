import React from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBg from "../components/ParticlesBg";
import Footer from "../components/Footer";
import logo from "../assets/logo.svg";
import "./landing.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="landing-container" style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
      <ParticlesBg />

      <header className="site-header" style={{ pointerEvents: 'auto', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <img src={logo} alt="SkillSwap logo" className="brand-logo-circle" />
      </header>

      <header style={{ textAlign: 'center', padding: '1rem', marginTop: '4rem' }}>
        <h1 className="title" style={{ fontSize: '3rem' }}>SkillSwap Dashboard</h1>
      </header>

      <main style={{ zIndex: 10, color: 'white', padding: '2rem' }}>
        <div className="glass-card-form" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>👋 Welcome back!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2.5rem' }}>
            You are now logged in. Explore your skills, connect with mentors, or start a new swap.
          </p>

          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/main-dashboard')}>My Profile</button>
            <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }} onClick={handleLogout}>
              Logout 🚪
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
