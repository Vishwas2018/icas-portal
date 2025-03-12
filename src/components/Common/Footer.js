import { FiExternalLink, FiHeart, FiMail } from 'react-icons/fi';

import { Link } from 'react-router-dom';
import React from 'react';

/**
 * Application footer component
 * Contains links, copyright, and additional information
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>ICAS Test Portal</h3>
            <p>
              Helping students excel in Mathematics, Science, and Digital Technologies 
              through comprehensive practice and personalized learning.
            </p>
          </div>
          
          <div className="footer-section">
            <h4>Resources</h4>
            <ul className="footer-links">
              <li><Link to="/resources/study-tips">Study Tips</Link></li>
              <li><Link to="/resources/practice">Practice Exams</Link></li>
              <li><Link to="/resources/parents">For Parents</Link></li>
              <li><Link to="/resources/teachers">For Teachers</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><Link to="/support/faq">FAQ</Link></li>
              <li><Link to="/support/contact">Contact Us</Link></li>
              <li><Link to="/support/technical">Technical Support</Link></li>
              <li><Link to="/support/feedback">Feedback</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><Link to="/legal/terms">Terms of Use</Link></li>
              <li><Link to="/legal/privacy">Privacy Policy</Link></li>
              <li><Link to="/legal/accessibility">Accessibility</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="copyright">
            &copy; {currentYear} ICAS Test Portal. All rights reserved.
          </div>
          <div className="contact-info">
            <a href="mailto:support@icastestportal.example.com">
              <FiMail /> support@icastestportal.example.com
            </a>
          </div>
          <div className="attribution">
            Made with <FiHeart className="heart-icon" /> for education
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;