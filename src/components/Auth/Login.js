import { FiEye, FiEyeOff, FiLock, FiLogIn, FiMail } from 'react-icons/fi';
import React, { useState } from 'react';

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Login component for user authentication
 */
const Login = () => {
  const { login, demoLogin, isLoading } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  /**
   * Validates form inputs
   * @returns {boolean} True if form is valid
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Handles form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setErrors({ form: 'Login failed. Please check your credentials.' });
      }
    } catch (error) {
      setErrors({ form: 'Login failed. Please try again.' });
    }
  };
  
  /**
   * Handles demo login
   */
  const handleDemoLogin = async () => {
    try {
      await demoLogin();
    } catch (error) {
      setErrors({ form: 'Demo login failed. Please try again.' });
    }
  };
  
  /**
   * Toggles password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue to ICAS Test Portal</p>
        </div>
        
        {errors.form && (
          <div className="error-message">{errors.form}</div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={errors.email ? 'error' : ''}
                disabled={isLoading}
              />
            </div>
            {errors.email && <div className="error-hint">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <div className="error-hint">{errors.password}</div>}
          </div>
          
          <div className="form-actions">
            <div className="remember-forgot">
              <label className="checkbox-label">
                <input type="checkbox" disabled={isLoading} />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>
            
            <button 
              type="submit" 
              className="auth-button primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner-border"></span>
              ) : (
                <>
                  <FiLogIn /> Sign In
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="auth-separator">
          <span>OR</span>
        </div>
        
        <button 
          className="auth-button secondary"
          onClick={handleDemoLogin}
          disabled={isLoading}
        >
          Try Demo Account
        </button>
        
        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/signup">Start a free trial</Link>
          </p>
        </div>
      </div>
      
      <div className="auth-info">
        <div className="info-content">
          <h2>ICAS Test Portal</h2>
          <h3>Prepare for success with our comprehensive exam practice platform</h3>
          <ul className="feature-list">
            <li>Access to Mathematics, Science, and Digital Technologies exams</li>
            <li>Personalized learning recommendations</li>
            <li>Detailed performance analytics</li>
            <li>Kid-friendly interface designed for young learners</li>
          </ul>
          <div className="trial-info">
            <h4>Start with a 7-day free trial</h4>
            <p>No credit card required</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;