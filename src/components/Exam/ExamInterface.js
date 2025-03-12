import {
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiFlag,
  FiHelpCircle,
  FiX
} from 'react-icons/fi';
import React, { useCallback, useEffect, useRef, useState } from 'react';
// Anti-cheating utilities
import { cleanupAntiCheating, setupAntiCheating } from '../../utils/antiCheating';
import { useNavigate, useParams } from 'react-router-dom';

import { getExamData } from '../../utils/mockDataService';

/**
 * ExamInterface Component - Main interface for taking exams
 */
const ExamInterface = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [cheatingWarnings, setCheatingWarnings] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);
  const [cheatingModalVisible, setCheatingModalVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const timerRef = useRef(null);
  const isMounted = useRef(true);
  const antiCheatingRef = useRef(null);
  
  // Load exam data
  useEffect(() => {
    // Simulate API call with timeout
    const loadExam = async () => {
      try {
        // In a real app, this would be an API call
        const data = getExamData(examId);
        
        if (isMounted.current) {
          setExam(data);
          setTimeRemaining(data.timeLimit);
          
          // Show welcome notification
          setNotificationMessage({
            type: 'info',
            text: `Welcome to your ${data.title} exam. Good luck!`
          });
          setTimeout(() => setNotificationMessage(null), 5000);
        }
      } catch (error) {
        console.error('Error loading exam:', error);
        
        if (isMounted.current) {
          setNotificationMessage({
            type: 'danger',
            text: 'Error loading exam. Please try again.'
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadExam();
    
    // Check for saved progress
    const savedProgress = localStorage.getItem(`exam_progress_${examId}`);
    if (savedProgress) {
      try {
        const { answers: savedAnswers, flagged, currentIndex, timeLeft } = JSON.parse(savedProgress);
        setAnswers(savedAnswers || {});
        setFlaggedQuestions(flagged || []);
        setCurrentQuestionIndex(currentIndex || 0);
        
        // Only restore time if not completed and time hasn't expired
        if (timeLeft > 0) {
          setTimeRemaining(timeLeft);
        }
        
        // Show notification
        setNotificationMessage({
          type: 'info',
          text: 'Your previous progress has been restored.'
        });
        setTimeout(() => setNotificationMessage(null), 5000);
      } catch (error) {
        console.error('Error restoring saved progress:', error);
      }
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [examId]);
  
  // Initialize anti-cheating measures
  useEffect(() => {
    if (!exam) return;
    
    const handleCheatingAttempt = (type) => {
      setCheatingWarnings(prevCount => {
        const newCount = prevCount + 1;
        
        if (newCount >= 3) {
          setCheatingModalVisible(true);
        } else {
          setNotificationMessage({
            type: 'warning',
            text: `Warning: ${type}. This may be considered cheating.`
          });
          setTimeout(() => setNotificationMessage(null), 5000);
        }
        
        return newCount;
      });
    };
    
    antiCheatingRef.current = setupAntiCheating({
      onTabSwitch: () => handleCheatingAttempt('Tab switching detected'),
      onWindowBlur: () => handleCheatingAttempt('Window focus lost'),
      onKeyboardShortcut: () => handleCheatingAttempt('Keyboard shortcut detected'),
      onContextMenu: (e) => e.preventDefault()
    });
    
    // Warn before closing/refreshing the page
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      cleanupAntiCheating(antiCheatingRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [exam]);
  
  // Timer functionality
  useEffect(() => {
    if (timeRemaining === null || !isMounted.current) return;
    
    const saveProgress = () => {
      localStorage.setItem(`exam_progress_${examId}`, JSON.stringify({
        answers,
        flagged: flaggedQuestions,
        currentIndex: currentQuestionIndex,
        timeLeft: timeRemaining
      }));
    };
    
    // Auto-save progress every 30 seconds
    const autoSaveInterval = setInterval(saveProgress, 30000);
    
    // Set up the countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          // Time's up - auto-submit
          clearInterval(timerRef.current);
          clearInterval(autoSaveInterval);
          handleSubmitExam();
          return 0;
        }
        
        // Show time warnings
        if (prevTime === 300) { // 5 minutes warning
          setNotificationMessage({
            type: 'info',
            text: '5 minutes remaining!'
          });
          setTimeout(() => setNotificationMessage(null), 5000);
        } else if (prevTime === 120) { // 2 minutes warning
          setNotificationMessage({
            type: 'warning',
            text: 'Only 2 minutes left!'
          });
          setTimeout(() => setNotificationMessage(null), 5000);
        } else if (prevTime === 60) { // 1 minute warning
          setNotificationMessage({
            type: 'warning',
            text: 'Final minute!'
          });
          setTimeout(() => setNotificationMessage(null), 5000);
        }
        
        return prevTime - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timerRef.current);
      clearInterval(autoSaveInterval);
      saveProgress(); // Save on unmount
    };
  }, [timeRemaining, answers, flaggedQuestions, currentQuestionIndex, examId]);
  
  /**
   * Navigate to a specific question
   */
  const goToQuestion = useCallback((index) => {
    if (index >= 0 && index < exam?.questions.length) {
      setCurrentQuestionIndex(index);
    }
  }, [exam]);
  
  /**
   * Navigate to previous question
   */
  const handlePrevQuestion = useCallback(() => {
    goToQuestion(currentQuestionIndex - 1);
  }, [currentQuestionIndex, goToQuestion]);
  
  /**
   * Navigate to next question
   */
  const handleNextQuestion = useCallback(() => {
    goToQuestion(currentQuestionIndex + 1);
  }, [currentQuestionIndex, goToQuestion]);
  
  /**
   * Handle answer selection
   */
  const handleAnswerSelect = useCallback((questionId, optionId) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: optionId
    }));
  }, []);
  
  /**
   * Toggle flagging of the current question
   */
  const toggleFlagQuestion = useCallback(() => {
    const currentQuestion = exam?.questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    setFlaggedQuestions(prevFlagged => {
      return prevFlagged.includes(currentQuestion.id)
        ? prevFlagged.filter(id => id !== currentQuestion.id)
        : [...prevFlagged, currentQuestion.id];
    });
  }, [exam, currentQuestionIndex]);
  
  /**
   * Check if all questions are answered
   */
  const areAllQuestionsAnswered = useCallback(() => {
    if (!exam) return false;
    return exam.questions.every(q => answers[q.id]);
  }, [exam, answers]);
  
  /**
   * Handle exam submission
   */
  const handleSubmitExam = useCallback(() => {
    // Clear local storage
    localStorage.removeItem(`exam_progress_${examId}`);
    
    // In a real app, this would send answers to the server
    // For demo, we'll simulate a submission by navigating to results
    navigate(`/exam/${examId}/results`, { 
      state: { 
        answers,
        timeUsed: exam.timeLimit - timeRemaining,
        flaggedQuestions
      } 
    });
  }, [answers, examId, navigate, exam, timeRemaining, flaggedQuestions]);
  
  /**
   * Confirm submission with warning if questions are unanswered
   */
  const confirmSubmit = useCallback(() => {
    if (!areAllQuestionsAnswered()) {
      setShowSubmitWarning(true);
    } else {
      handleSubmitExam();
    }
  }, [areAllQuestionsAnswered, handleSubmitExam]);
  
  /**
   * Format time for display (MM:SS)
   */
  const formatTime = useCallback((seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  /**
   * Calculate progress percentage
   */
  const calculateProgress = useCallback(() => {
    if (!exam) return 0;
    return (Object.keys(answers).length / exam.questions.length) * 100;
  }, [exam, answers]);
  
  // Display loading state
  if (loading) {
    return (
      <div className="exam-loading">
        <div className="loading-spinner"></div>
        <p>Loading exam...</p>
      </div>
    );
  }
  
  // Handle case where exam couldn't be loaded
  if (!exam) {
    return (
      <div className="exam-error">
        <h2>Error Loading Exam</h2>
        <p>We couldn't load the exam you requested. Please try again later.</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </button>
      </div>
    );
  }
  
  const currentQuestion = exam.questions[currentQuestionIndex];
  const isQuestionFlagged = flaggedQuestions.includes(currentQuestion.id);
  const selectedAnswer = answers[currentQuestion.id];
  
  return (
    <div className={`exam-interface ${isAccessibilityMode ? 'accessibility-mode' : ''}`}>
      {/* Header bar */}
      <div className="exam-header">
        <h1>{exam.title}</h1>
        <div className="exam-timer">
          <FiClock className={timeRemaining < 300 ? 'timer-warning' : ''} />
          <span className={`time-display ${timeRemaining < 300 ? 'time-warning' : ''}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="exam-progress-container">
        <div 
          className="exam-progress-bar"
          style={{ width: `${calculateProgress()}%` }}
        ></div>
        <span className="progress-text">
          {Object.keys(answers).length} of {exam.questions.length} answered
        </span>
      </div>
      
      {/* Main exam content */}
      <div className="exam-content">
        {/* Question navigation sidebar */}
        <div className="question-navigation">
          <div className="question-list">
            {exam.questions.map((question, index) => (
              <button
                key={question.id}
                className={`question-nav-button ${currentQuestionIndex === index ? 'active' : ''} 
                           ${answers[question.id] ? 'answered' : ''} 
                           ${flaggedQuestions.includes(question.id) ? 'flagged' : ''}`}
                onClick={() => goToQuestion(index)}
              >
                {question.number}
                {flaggedQuestions.includes(question.id) && (
                  <FiFlag className="flag-icon" />
                )}
              </button>
            ))}
          </div>
          <div className="navigation-legend">
            <div className="legend-item">
              <div className="legend-color current"></div>
              <span>Current</span>
            </div>
            <div className="legend-item">
              <div className="legend-color answered"></div>
              <span>Answered</span>
            </div>
            <div className="legend-item">
              <div className="legend-color flagged"></div>
              <span>Flagged</span>
            </div>
          </div>
        </div>
        
        {/* Question display area */}
        <div className="question-display">
          <div className="question-header">
            <h2>Question {currentQuestion.number}</h2>
            <div className="question-actions">
              <button 
                className={`flag-button ${isQuestionFlagged ? 'flagged' : ''}`}
                onClick={toggleFlagQuestion}
                aria-label={isQuestionFlagged ? "Unflag question" : "Flag question for review"}
              >
                <FiFlag />
                {isQuestionFlagged ? 'Flagged' : 'Flag'}
              </button>
              <button
                className="hint-button"
                onClick={() => setShowHint(!showHint)}
                aria-label="Show hint"
              >
                <FiHelpCircle />
                Hint
              </button>
            </div>
          </div>
          
          <div className="question-content">
            <p>{currentQuestion.content}</p>
            {currentQuestion.image && (
              <div className="question-image">
                <img 
                  src={currentQuestion.image} 
                  alt="Question visual"
                  loading="lazy" 
                />
              </div>
            )}
            
            {showHint && (
              <div className="hint-box">
                <div className="hint-header">
                  <FiHelpCircle /> Helpful Tip
                  <button 
                    className="close-hint" 
                    onClick={() => setShowHint(false)}
                    aria-label="Close hint"
                  >
                    <FiX />
                  </button>
                </div>
                <p>Think about what approach would be most efficient for solving this problem. Remember the key concepts we've covered.</p>
              </div>
            )}
            
            <div className="answer-options">
              {currentQuestion.options.map(option => (
                <label 
                  key={option.id} 
                  className={`answer-option ${selectedAnswer === option.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id}`}
                    value={option.id}
                    checked={selectedAnswer === option.id}
                    onChange={() => handleAnswerSelect(currentQuestion.id, option.id)}
                  />
                  <span className="option-text">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="question-navigation-buttons">
            <button
              className="nav-button prev"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              aria-label="Previous question"
            >
              <FiArrowLeft /> Previous
            </button>
            
            {currentQuestionIndex < exam.questions.length - 1 ? (
              <button
                className="nav-button next"
                onClick={handleNextQuestion}
                aria-label="Next question"
              >
                Next <FiArrowRight />
              </button>
            ) : (
              <button
                className="nav-button submit"
                onClick={confirmSubmit}
                aria-label="Submit exam"
              >
                <FiCheckCircle /> Submit Exam
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Notification */}
      {notificationMessage && (
        <div className={`notification-toast ${notificationMessage.type}`}>
          {notificationMessage.type === 'warning' && <FiAlertTriangle />}
          {notificationMessage.type === 'info' && <FiCheckCircle />}
          <p>{notificationMessage.text}</p>
        </div>
      )}
      
      {/* Submit warning modal */}
      {showSubmitWarning && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Unanswered Questions</h3>
            <p>You haven't answered all questions. Are you sure you want to submit the exam?</p>
            <div className="modal-actions">
              <button 
                className="modal-button secondary"
                onClick={() => setShowSubmitWarning(false)}
              >
                Continue Exam
              </button>
              <button 
                className="modal-button primary"
                onClick={handleSubmitExam}
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cheating warning modal */}
      {cheatingModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content warning">
            <FiAlertTriangle className="warning-icon" />
            <h3>Warning: Suspicious Activity</h3>
            <p>Multiple violations have been detected. This activity may be considered cheating.</p>
            <p>Please focus on your exam. Further violations may result in exam termination.</p>
            <div className="modal-actions">
              <button 
                className="modal-button primary"
                onClick={() => setCheatingModalVisible(false)}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Accessibility toggle */}
      <button 
        className="accessibility-toggle"
        onClick={() => setIsAccessibilityMode(!isAccessibilityMode)}
        aria-label="Toggle accessibility mode"
      >
        {isAccessibilityMode ? 'Standard Mode' : 'Accessibility Mode'}
      </button>
    </div>
  );
};

export default ExamInterface;