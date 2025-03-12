import {
  FiAward,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiFlag,
  FiStar
} from 'react-icons/fi';
import React, { useEffect, useState } from 'react';
import {
  getAchievements,
  getRecentActivity,
  getRecommendedExams,
  getSubjectProgress
} from '../../utils/mockDataService';

import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for animated mounting of components
 * @returns {boolean} Whether the component should be visible
 */
const useAnimatedMount = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return isVisible;
};

/**
 * StudentDashboard Component - Main dashboard for student users
 */
const StudentDashboard = () => {
  const isVisible = useAnimatedMount();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('mathematics');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [recommendedExams, setRecommendedExams] = useState([]);
  const [subjectProgress, setSubjectProgress] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  
  // Subject color themes
  const subjectColors = {
    mathematics: { primary: '#4264D0', secondary: '#E0E7FF' },
    science: { primary: '#38B28C', secondary: '#E0F8EF' },
    digitalTech: { primary: '#F06292', secondary: '#FCE4EC' }
  };
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // In a real app, these would be API calls with proper error handling
        const exams = getRecommendedExams();
        const progress = getSubjectProgress();
        const activity = getRecentActivity();
        const achievementData = getAchievements();
        
        setRecommendedExams(exams);
        setSubjectProgress(progress);
        setRecentActivity(activity);
        setAchievements(achievementData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  /**
   * Navigates to exam page for the selected exam
   * @param {string} examId - ID of the exam to start
   */
  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };
  
  /**
   * Gets color style object based on subject
   * @param {string} subject - Subject identifier
   * @returns {Object} Style object with colors
   */
  const getColorStyle = (subject) => {
    const colors = subjectColors[subject] || subjectColors.mathematics;
    return {
      background: colors.secondary,
      color: colors.primary,
      borderColor: colors.primary
    };
  };
  
  /**
   * Gets time-based greeting message
   * @returns {string} Appropriate greeting for current time of day
   */
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Ready for some morning practice?";
    if (hour < 17) return "Time for an afternoon study session!";
    return "Evening is perfect for reviewing what you've learned!";
  };
  
  /**
   * Gets day label for streak calendar
   * @param {number} index - Day index (0-6)
   * @returns {string} Single letter day label
   */
  const getDayLabel = (index) => {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    return days[index];
  };
  
  /**
   * Capitalizes the first letter of a string
   * @param {string} string - String to capitalize
   * @returns {string} Capitalized string
   */
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  // Display loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }
  
  return (
    <div className={`dashboard-container ${isVisible ? 'visible' : ''}`}>
      {/* Welcome message with time awareness */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Hello, {user?.firstName || 'Student'}!</h1>
          <p>{getTimeBasedGreeting()}</p>
          {user?.trialDaysLeft > 0 && (
            <div className="trial-notice">
              <FiClock /> {user.trialDaysLeft} days left in your free trial
            </div>
          )}
        </div>
        <div className="quick-actions">
          <button className="action-button primary" onClick={() => navigate('/exam/recommended')}>
            Quick Practice
          </button>
          <button className="action-button secondary" onClick={() => navigate('/achievements')}>
            <FiAward /> Achievements
          </button>
        </div>
      </div>
      
      {/* Subject selection tabs */}
      <div className="subject-tabs">
        {Object.keys(subjectColors).map(subject => (
          <button
            key={subject}
            className={`subject-tab ${selectedSubject === subject ? 'active' : ''}`}
            style={selectedSubject === subject ? getColorStyle(subject) : {}}
            onClick={() => setSelectedSubject(subject)}
          >
            {capitalizeFirstLetter(subject)}
            <div 
              className="progress-indicator" 
              style={{ 
                width: `${subjectProgress[subject]}%`, 
                background: subjectColors[subject].primary 
              }} 
            />
          </button>
        ))}
      </div>
      
      {/* Main dashboard content */}
      <div className="dashboard-content">
        <div className="dashboard-column">
          <div className="dashboard-card recommended-exams">
            <h2>Recommended for You</h2>
            <div className="exam-list">
              {recommendedExams
                .filter(exam => !selectedSubject || exam.subject === selectedSubject)
                .map(exam => (
                  <div 
                    key={exam.id} 
                    className="exam-card" 
                    style={getColorStyle(exam.subject)}
                  >
                    <div className="exam-info">
                      <h3>{exam.title}</h3>
                      <div className="exam-meta">
                        <span><FiBarChart2 /> {exam.difficulty}</span>
                        <span><FiClock /> {exam.timeEstimate} min</span>
                      </div>
                    </div>
                    <button 
                      className="start-exam-button"
                      style={{ background: subjectColors[exam.subject].primary }}
                      onClick={() => handleStartExam(exam.id)}
                    >
                      Start
                    </button>
                  </div>
                ))}
            </div>
          </div>
          
          <div className="dashboard-card achievements-card">
            <h2>Achievements</h2>
            <div className="achievements-list">
              {achievements.map((achievement, index) => (
                <div key={index} className="achievement-item">
                  <div className="achievement-icon" style={getColorStyle(selectedSubject)}>
                    {index === 0 ? <FiStar /> : index === 1 ? <FiAward /> : <FiCalendar />}
                  </div>
                  <div className="achievement-info">
                    <h3>{achievement.title}</h3>
                    <p>{achievement.description}</p>
                    <div className="achievement-progress">
                      <div 
                        className="progress-bar"
                        style={{ 
                          width: `${(achievement.progress / achievement.total) * 100}%`,
                          background: subjectColors[selectedSubject].primary 
                        }}
                      />
                    </div>
                    <span className="progress-text">
                      {achievement.progress} / {achievement.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="dashboard-column">
          <div className="dashboard-card study-streak">
            <h2>Study Streak</h2>
            <div className="streak-calendar">
              {/* Calendar display showing days studied in the past week */}
              <div className="streak-days">
                {Array(7).fill(0).map((_, index) => (
                  <div 
                    key={index} 
                    className={`streak-day ${index === 1 || index === 4 ? 'completed' : ''}`}
                    style={index === 1 || index === 4 ? { background: subjectColors[selectedSubject].primary } : {}}
                  >
                    {getDayLabel(index)}
                  </div>
                ))}
              </div>
              <p className="streak-message">You're on a 2-day streak! Keep going!</p>
            </div>
          </div>
          
          <div className="dashboard-card recent-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-date">{activity.date}</div>
                  <div className="activity-details">
                    <p>{activity.action}</p>
                    {activity.score !== null && (
                      <div 
                        className="activity-score" 
                        style={{ color: subjectColors[selectedSubject].primary }}
                      >
                        {activity.score}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="dashboard-card improvement-tips">
            <h2>Your Improvement Areas</h2>
            <div className="tips-list">
              <div className="tip-item" style={getColorStyle(selectedSubject)}>
                <FiFlag className="tip-icon" />
                <div className="tip-content">
                  <h3>Geometry</h3>
                  <p>Practice with triangles and angles to improve your score.</p>
                  <button 
                    className="tip-action-button"
                    style={{ background: subjectColors[selectedSubject].primary }}
                  >
                    Practice Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;