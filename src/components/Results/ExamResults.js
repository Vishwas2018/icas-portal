import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  FiArrowRight,
  FiBarChart2,
  FiBookOpen,
  FiCheck,
  FiClock,
  FiDownload,
  FiFlag,
  FiHelpCircle,
  FiHome,
  FiShare2,
  FiTarget,
  FiTrendingUp,
  FiX
} from 'react-icons/fi';
import React, { useEffect, useState } from 'react';
import { calculateExamResults, getExamData } from '../../utils/mockDataService';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

/**
 * ExamResults Component - Displays comprehensive results and analytics
 */
const ExamResults = () => {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState(null);
  const [focusedQuestion, setFocusedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get user's answers from navigation state or localStorage
  const userAnswers = location.state?.answers || {};
  const timeUsed = location.state?.timeUsed || 0;
  
  useEffect(() => {
    // Load exam data and calculate results
    const loadResults = async () => {
      try {
        // In a real app, this would be an API call
        const examData = getExamData(examId);
        setExam(examData);
        
        if (examData) {
          const calculatedResults = calculateExamResults(examData, userAnswers, timeUsed);
          setResults(calculatedResults);
          
          // Save results to localStorage for persistence
          localStorage.setItem(`exam_results_${examId}`, JSON.stringify(calculatedResults));
        }
      } catch (error) {
        console.error('Error calculating results:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadResults();
  }, [examId, userAnswers, timeUsed]);
  
  /**
   * Generates personalized recommendations based on performance
   * @returns {Array} List of recommendation objects
   */
  const generateRecommendations = () => {
    if (!results) return [];
    
    const recommendations = [];
    
    // Add topic-specific recommendations
    results.improvementAreas.forEach(area => {
      recommendations.push({
        type: 'topic',
        title: `Improve ${area.topic}`,
        description: area.recommendation,
        actionText: 'Practice Now',
        action: () => navigate(`/practice/${area.topic.toLowerCase()}`)
      });
    });
    
    // Add time management recommendation if needed
    if (results.timeEfficiency.includes('Rushed')) {
      recommendations.push({
        type: 'time',
        title: 'Time Management',
        description: 'You completed the exam quickly. Consider taking more time to review your answers.',
        actionText: 'Time Management Tips',
        action: () => navigate('/resources/time-management')
      });
    }
    
    // Add difficulty-based recommendation
    const hardScore = results.difficultyResults.hard.score;
    if (hardScore < 60) {
      recommendations.push({
        type: 'difficulty',
        title: 'Challenge Yourself',
        description: 'You might benefit from more practice with difficult problems.',
        actionText: 'Try Advanced Problems',
        action: () => navigate('/practice/advanced')
      });
    }
    
    return recommendations;
  };
  
  /**
   * Formats seconds into minutes:seconds display
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time (MM:SS)
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  /**
   * Handles print functionality
   */
  const handlePrintResults = () => {
    window.print();
  };
  
  /**
   * Handles sharing results
   */
  const handleShareResults = () => {
    // In a real app, this would generate a shareable link
    alert('Sharing functionality would be implemented here. This would generate a link that parents or teachers could access.');
  };
  
  /**
   * Handles downloading results as PDF
   */
  const handleDownloadResults = () => {
    // In a real app, this would generate a PDF
    alert('Download functionality would be implemented here. This would generate a PDF with the student\'s results.');
  };
  
  // Display loading state
  if (loading) {
    return (
      <div className="results-loading">
        <div className="loading-spinner"></div>
        <p>Calculating your results...</p>
      </div>
    );
  }
  
  // Handle case where results couldn't be loaded
  if (!exam || !results) {
    return (
      <div className="results-error">
        <h2>Error Loading Results</h2>
        <p>We couldn't load your exam results. Please try again later.</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </button>
      </div>
    );
  }
  
  // Prepare data for charts
  const topicChartData = Object.entries(results.topicResults).map(([topic, data]) => ({
    name: topic,
    score: data.score,
    average: 70, // Mock national average for comparison
  }));
  
  const difficultyChartData = Object.entries(results.difficultyResults).map(([level, data]) => ({
    name: level.charAt(0).toUpperCase() + level.slice(1),
    score: data.score,
    average: 70, // Mock national average for comparison
  }));
  
  return (
    <div className="exam-results">
      {/* Results Header */}
      <div className="results-header">
        <h1>{exam.title} Results</h1>
        <div className="results-actions">
          <button className="action-button" onClick={handlePrintResults}>
            <FiDownload /> Print
          </button>
          <button className="action-button" onClick={handleDownloadResults}>
            <FiDownload /> Download
          </button>
          <button className="action-button" onClick={handleShareResults}>
            <FiShare2 /> Share
          </button>
        </div>
      </div>
      
      {/* Results Summary Card */}
      <div className="results-summary-card">
        <div className="grade-display">
          <div className="grade">{results.grade}</div>
          <p className="grade-label">Grade</p>
        </div>
        
        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-value">{results.scorePercentage}%</div>
            <p className="stat-label">Overall Score</p>
          </div>
          <div className="stat-item">
            <div className="stat-value">{results.correctCount}/{results.totalQuestions}</div>
            <p className="stat-label">Questions Correct</p>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatTime(results.timeUsed)}</div>
            <p className="stat-label">Time Used</p>
          </div>
        </div>
        
        <div className="national-comparison">
          <p>Your score is {results.scorePercentage > results.nationalAverage ? 'above' : 'below'} the national average of {results.nationalAverage}%</p>
          <div className="comparison-bar">
            <div className="comparison-track">
              <div 
                className="national-marker"
                style={{ left: `${results.nationalAverage}%` }}
              ></div>
              <div 
                className="your-score-marker"
                style={{ left: `${results.scorePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analysis Tabs */}
      <div className="results-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiBarChart2 /> Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          <FiBookOpen /> Questions
        </button>
        <button 
          className={`tab-button ${activeTab === 'improvement' ? 'active' : ''}`}
          onClick={() => setActiveTab('improvement')}
        >
          <FiTrendingUp /> Improvement Plan
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="results-card">
              <h2>Performance by Topic</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topicChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#4264D0" name="Your Score" />
                    <Bar dataKey="average" fill="#90caf9" name="National Average" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="results-card">
              <h2>Performance by Difficulty</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={difficultyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#38B28C" name="Your Score">
                      {difficultyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score < 60 ? '#f06292' : '#38B28C'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="stats-grid">
              <div className="stats-card">
                <FiClock className="stats-icon" />
                <h3>Time Efficiency</h3>
                <p>{results.timeEfficiency}</p>
                <div className="stats-meter">
                  <div 
                    className="stats-meter-fill"
                    style={{ width: `${(results.timeUsed / exam.timeLimit) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="stats-card">
                <FiTarget className="stats-icon" />
                <h3>Strongest Topic</h3>
                {Object.entries(results.topicResults)
                  .sort((a, b) => b[1].score - a[1].score)
                  .slice(0, 1)
                  .map(([topic, data]) => (
                    <div key={topic}>
                      <p>{topic}</p>
                      <div className="topic-score">{data.score}%</div>
                    </div>
                  ))}
              </div>
              
              <div className="stats-card">
                <FiFlag className="stats-icon" />
                <h3>Focus Area</h3>
                {results.improvementAreas.slice(0, 1).map((area) => (
                  <div key={area.topic}>
                    <p>{area.topic}</p>
                    <div className="topic-score">{area.score}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="questions-tab">
            {focusedQuestion ? (
              <div className="question-detail">
                <button 
                  className="back-button"
                  onClick={() => setFocusedQuestion(null)}
                >
                  Back to Questions
                </button>
                
                <div className="question-card">
                  <div className="question-header">
                    <h3>Question {focusedQuestion.number}</h3>
                    <div className={`question-result ${focusedQuestion.isCorrect ? 'correct' : 'incorrect'}`}>
                      {focusedQuestion.isCorrect ? (
                        <><FiCheck /> Correct</>
                      ) : (
                        <><FiX /> Incorrect</>
                      )}
                    </div>
                  </div>
                  
                  <div className="question-metadata">
                    <span className="question-topic">{focusedQuestion.topic}</span>
                    <span className="question-difficulty">{
                      focusedQuestion.difficulty.charAt(0).toUpperCase() + 
                      focusedQuestion.difficulty.slice(1)
                    }</span>
                  </div>
                  
                  <p className="question-content">{focusedQuestion.content}</p>
                  
                  <div className="question-options">
                    {focusedQuestion.options.map((option) => (
                      <div 
                        key={option.id}
                        className={`result-option ${
                          option.id === focusedQuestion.correctAnswer 
                            ? 'correct-answer' 
                            : option.id === focusedQuestion.userAnswer && !focusedQuestion.isCorrect
                              ? 'incorrect-answer'
                              : ''
                        }`}
                      >
                        <span className="option-indicator">
                          {option.id === focusedQuestion.correctAnswer && <FiCheck />}
                          {option.id === focusedQuestion.userAnswer && !focusedQuestion.isCorrect && <FiX />}
                        </span>
                        <span className="option-text">{option.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="explanation-box">
                    <div className="explanation-header">
                      <FiHelpCircle /> Explanation
                    </div>
                    <p>{focusedQuestion.explanation}</p>
                  </div>
                  
                  <div className="question-navigation">
                    <button 
                      className="nav-button"
                      disabled={focusedQuestion.number === 1}
                      onClick={() => {
                        const prevQuestion = results.questionDetails.find(
                          q => q.number === focusedQuestion.number - 1
                        );
                        if (prevQuestion) setFocusedQuestion(prevQuestion);
                      }}
                    >
                      Previous Question
                    </button>
                    <button 
                      className="nav-button"
                      disabled={focusedQuestion.number === results.totalQuestions}
                      onClick={() => {
                        const nextQuestion = results.questionDetails.find(
                          q => q.number === focusedQuestion.number + 1
                        );
                        if (nextQuestion) setFocusedQuestion(nextQuestion);
                      }}
                    >
                      Next Question
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="questions-list">
                <div className="questions-filter">
                  <button className="filter-button active">All Questions</button>
                  <button className="filter-button">Correct</button>
                  <button className="filter-button">Incorrect</button>
                </div>
                
                <div className="questions-grid">
                  {results.questionDetails.map(question => (
                    <div 
                      key={question.id}
                      className={`question-item ${question.isCorrect ? 'correct' : 'incorrect'}`}
                      onClick={() => setFocusedQuestion(question)}
                    >
                      <div className="question-number">{question.number}</div>
                      <div className="question-status">
                        {question.isCorrect ? <FiCheck /> : <FiX />}
                      </div>
                      <div className="question-meta">
                        <span className="question-topic">{question.topic}</span>
                        <span className="question-difficulty">{
                          question.difficulty.charAt(0).toUpperCase() + 
                          question.difficulty.slice(1)
                        }</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Improvement Plan Tab */}
        {activeTab === 'improvement' && (
          <div className="improvement-tab">
            <div className="improvement-overview">
              <h2>Your Personalized Improvement Plan</h2>
              <p className="improvement-summary">
                Based on your performance, we've identified these key areas to focus on.
                This plan will help you improve your skills and performance on future exams.
              </p>
            </div>
            
            <div className="recommendation-cards">
              {generateRecommendations().map((recommendation, index) => (
                <div 
                  key={index}
                  className={`recommendation-card ${recommendation.type}`}
                >
                  <div className="recommendation-icon">
                    {recommendation.type === 'topic' && <FiBookOpen />}
                    {recommendation.type === 'time' && <FiClock />}
                    {recommendation.type === 'difficulty' && <FiTarget />}
                  </div>
                  <h3>{recommendation.title}</h3>
                  <p>{recommendation.description}</p>
                  <button 
                    className="recommendation-action"
                    onClick={recommendation.action}
                  >
                    {recommendation.actionText} <FiArrowRight />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="practice-resources">
              <h3>Additional Practice Resources</h3>
              <div className="resources-list">
                <div className="resource-item">
                  <div className="resource-icon">
                    <FiBookOpen />
                  </div>
                  <div className="resource-content">
                    <h4>Topic-Focused Practice Questions</h4>
                    <p>Strengthen specific areas with targeted question sets</p>
                    <button className="resource-button">Access Resources</button>
                  </div>
                </div>
                
                <div className="resource-item">
                  <div className="resource-icon">
                    <FiClock />
                  </div>
                  <div className="resource-content">
                    <h4>Timed Mini-Exams</h4>
                    <p>Improve time management with short, focused assessments</p>
                    <button className="resource-button">Start Mini-Exam</button>
                  </div>
                </div>
                
                <div className="resource-item">
                  <div className="resource-icon">
                    <FiTarget />
                  </div>
                  <div className="resource-content">
                    <h4>Video Tutorials</h4>
                    <p>Watch expert explanations of key concepts</p>
                    <button className="resource-button">View Tutorials</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Next Steps */}
      <div className="next-steps">
        <button className="next-step-button" onClick={() => navigate('/dashboard')}>
          <FiHome /> Return to Dashboard
        </button>
        <button className="next-step-button primary" onClick={() => navigate('/exams')}>
          Try Another Exam <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default ExamResults;