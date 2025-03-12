import { FiAward, FiBook, FiHome, FiLogOut, FiMenu, FiUser, FiX } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import React, { useState } from 'react';

/**
 * Application header component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - User object
 * @param {Function} props.onLogout - Logout handler
 * @param {boolean} props.isAuthenticated - Authentication status
 */
const Header = ({ user, onLogout, isAuthenticated }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Active path checker
  const isActive = path => location.pathname === path;
  
  // Toggle mobile menu
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo-section">
          <Link to="/" className="logo">
            <img 
              src="/logo-placeholder.png" 
              alt="ICAS Test Portal" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40" viewBox="0 0 150 40"><rect width="150" height="40" fill="%234264D0"/><text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">ICAS Portal</text></svg>';
              }}
            />
          </Link>
          <div className="mobile-toggle" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </div>
        </div>
        
        <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {isAuthenticated ? (
            <>
              <ul className="nav-links">
                <li>
                  <Link 
                    to="/dashboard" 
                    className={isActive('/dashboard') ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiHome /> Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/exams" 
                    className={isActive('/exams') ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiBook /> Exams
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/achievements" 
                    className={isActive('/achievements') ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiAward /> Achievements
                  </Link>
                </li>
              </ul>
              
              <div className="user-section">
                <div className="user-info">
                  <FiUser className="user-icon" />
                  <span>{user?.firstName || 'Student'}</span>
                </div>
                <button className="logout-button" onClick={onLogout}>
                  <FiLogOut /> Logout
                </button>
              </div>
            </>
          ) : (
            <ul className="nav-links">
              <li>
                <Link 
                  to="/login" 
                  className={isActive('/login') ? 'active' : ''}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/signup" 
                  className="signup-button"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Free Trial
                </Link>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;