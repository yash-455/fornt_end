import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
  return (
    <div className="landing-container">
      {/* Header with Auth Buttons */}
      <header className="landing-header">
        <div className="logo">
          <span className="logo-icon">⚖️</span> LegalAssist AI
        </div>
        <div className="header-actions">
          <Link to="/login" className="btn btn-outline">Login</Link>
          <Link to="/register" className="btn btn-primary">Register</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="animate-fade-in-up">Your Intelligent Legal Companion</h1>
          <p className="subtitle animate-fade-in-up delay-1">
            Streamline your legal practice with an advanced digital assistant. Manage records, summarize lengthy documents, and chat securely with your case files using our personalized AI.
          </p>
          <div className="hero-buttons animate-fade-in-up delay-2">
            <Link to="/register" className="btn btn-large">Get Started Now</Link>
          </div>
        </section>
            
            {/* Features Section */}
        <section className="features-section">
            <h2 className="animate-fade-in delay-2">Everything you need to win your case</h2>
            <div className="features-grid">
                
                {/* Feature 1 */}
                <div className="feature-card animate-slide-up delay-1">
                <div className="feature-header">
                    <h3>Digital Record Keeping</h3>
                </div>
                <div className="feature-details">
                    <div className="feature-details-inner">
                    <p>Keep a pristine, organized record of all your cases, associated documents, and upcoming hearing schedules in one unified dashboard.</p>
                    </div>
                </div>
                </div>

                {/* Feature 2 */}
                <div className="feature-card animate-slide-up delay-2">
                <div className="feature-header">
                    <h3>Document Summarization</h3>
                </div>
                <div className="feature-details">
                    <div className="feature-details-inner">
                    <p>Save hours of reading. Instantly generate highly accurate, concise summaries of lengthy legal documents, contracts, and case files.</p>
                    </div>
                </div>
                </div>

                {/* Feature 3 */}
                <div className="feature-card animate-slide-up delay-3">
                <div className="feature-header">
                    <h3>Personalized AI Assistant</h3>
                </div>
                <div className="feature-details">
                    <div className="feature-details-inner">
                    <p>Experience the power of RAG technology. Chat directly with your uploaded case data to find precedents, extract facts, and build arguments faster.</p>
                    </div>
                </div>
                </div>

             </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">⚖️</span> LegalAssist AI
            <p className="copyright">&copy; {new Date().getFullYear()} All rights reserved.</p>
          </div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Support</a>
          </div>
        </div>
      </footer>
      
    </div>
  );
};

export default Landing;