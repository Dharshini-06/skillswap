import "./landing.css";
import heroImg from "../assets/hero-3d.png";
import logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import SkillsGrid from "../components/SkillsGrid";
import Footer from "../components/Footer";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

      <header className="site-header" aria-label="SkillSwap Home">
        <img src={logo} alt="SkillSwap" className="brand-logo-circle" />
      </header>

      <main className="landing" aria-labelledby="hero-title">
        {/* LEFT: content */}
        <section className="left" aria-label="Welcome">
          <h1 id="hero-title" className="title">
            SkillSwap
          </h1>

          <p className="tagline">
            Learn by sharing. Grow by teaching. Exchange real skills with people in your community — build, teach and learn together.
          </p>

      <div className="btn-group">
        {localStorage.getItem("userId") ? (
          <button
            className="btn btn-primary"
            onClick={() => {
              // prefer direct navigation to onboarding if onboarding not completed
              const onboarded = localStorage.getItem('onboardingCompleted') === 'true';
              navigate(onboarded ? '/dashboard' : '/onboarding');
            }}
          >
            Go to Dashboard 🚀
          </button>
        ) : (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/register')}
                  style={{ marginLeft: '12px' }}
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* New Social Proof Section */}
          <div className="social-proof-micro">
            <div className="avatar-stack">
              <div className="avatar av-1"></div>
              <div className="avatar av-2"></div>
              <div className="avatar av-3"></div>
              <div className="avatar av-4"></div>
              <div className="avatar-count">+1.2k</div>
            </div>
            <p className="social-text">Join 1,200+ learners & mentors already swapping skills.</p>
          </div>

          <p className="breakthrough-line">
            “Your skill is someone else’s next breakthrough.”
          </p>
        </section>

        {/* RIGHT: hero image */}
        <aside className="right" aria-hidden="true">
          <div className="how-it-works-block" aria-hidden="true">
            <h3 className="how-title">How it works</h3>
            <div className="step-item">
              <div className="step-icon">🎓</div>
              <div className="step-content">
                <strong>Choose a Skill</strong>
                <span>Pick what you want to learn or teach</span>
              </div>
            </div>
            <div className="step-item">
              <div className="step-icon">🔍</div>
              <div className="step-content">
                <strong>Find a Match</strong>
                <span>Connect with peers in your community</span>
              </div>
            </div>
            <div className="step-item">
              <div className="step-icon">🤝</div>
              <div className="step-content">
                <strong>Swap & Learn</strong>
                <span>Exchange knowledge through live calls</span>
              </div>
            </div>
            <div className="step-item">
              <div className="step-icon">🌱</div>
              <div className="step-content">
                <strong>Grow Together</strong>
                <span>Build your reputation and master new skills</span>
              </div>
            </div>
          </div>
        </aside>

        {/* About Section */}
        <section className="about-section-wrapper">
          <div className="about-container">
            <h2 className="section-title">The Art of the Skill Swap</h2>
            <p className="about-text">
              SkillSwap is built on a simple, powerful idea: <strong>Everyone has something to teach, and everyone has something to learn.</strong>
              If you're a Java expert looking to master Python, we connect you with a Python developer who wants to learn Java.
              No fees, just knowledge exchange.
            </p>

            <div className="features-grid-original">
              <div className="feature-card-original">
                <div className="f-icon">🔄</div>
                <h3>Mutual Exchange</h3>
                <p>Swap what you know for what you don't. A true peer-to-peer ecosystem where teaching is the currency for learning.</p>
              </div>
              <div className="feature-card-original">
                <div className="f-icon">📹</div>
                <h3>Live Interactions</h3>
                <p>Learn through Google Meet, Zoom, or video calls. Real-time feedback and direct human interaction for faster growth.</p>
              </div>
              <div className="feature-card-original">
                <div className="f-icon">🌱</div>
                <h3>Zero Cost Learning</h3>
                <p>Democratizing education by removing financial barriers. Your expertise is your ticket to learning any new skill.</p>
              </div>
              <div className="feature-card-original">
                <div className="f-icon">🛡️</div>
                <h3>Verified Mentorship</h3>
                <p>Join a community of serious practitioners. Build your reputation by helping others succeed and learn in return.</p>
              </div>
            </div>
          </div>
        </section>

        <SkillsGrid />

        <Footer />
      </main>
    </div>
  );
}
