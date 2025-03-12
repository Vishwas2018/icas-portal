/**
 * Mock Data Service
 * 
 * This file provides mock data for the ICAS Test Portal demo.
 * In a production environment, these functions would make API calls
 * to fetch real data from a backend service.
 */

/**
 * Get mock exam data
 * @param {string} examId - ID of the exam
 * @returns {Object} Exam data including questions and metadata
 */
export const getExamData = (examId) => {
    // Get subject from examId
    const subject = examId.includes('math') 
      ? 'mathematics' 
      : examId.includes('science')
        ? 'science'
        : 'digitalTech';
    
    // Determine time limit based on subject
    const timeLimit = subject === 'mathematics' 
      ? 40 * 60 
      : subject === 'science' 
        ? 30 * 60 
        : 45 * 60;
      
    return {
      id: examId,
      title: examId.includes('2023') ? `${subject.charAt(0).toUpperCase() + subject.slice(1)} 2023` : `${subject.charAt(0).toUpperCase() + subject.slice(1)} 2022`,
      subject,
      timeLimit, // in seconds
      questions: Array(20).fill(0).map((_, index) => ({
        id: `q${index + 1}`,
        number: index + 1,
        content: `Question ${index + 1}: What is the result of the following equation?`,
        difficulty: index % 3 === 0 ? 'easy' : (index % 3 === 1 ? 'medium' : 'hard'),
        topic: ['Algebra', 'Geometry', 'Numbers', 'Statistics', 'Patterns'][Math.floor(index / 4)],
        correctAnswer: `q${index + 1}_${['a', 'b', 'c', 'd'][index % 4]}`,
        explanation: `This question tests your understanding of ${['Algebra', 'Geometry', 'Numbers', 'Statistics', 'Patterns'][Math.floor(index / 4)]}. The correct approach is to first identify the pattern, then apply the appropriate formula.`,
        options: [
          { id: `q${index + 1}_a`, text: 'Answer option A' },
          { id: `q${index + 1}_b`, text: 'Answer option B' },
          { id: `q${index + 1}_c`, text: 'Answer option C' },
          { id: `q${index + 1}_d`, text: 'Answer option D' }
        ]
      }))
    };
  };
  
  /**
   * Get recommended exams for a student
   * @param {string} subject - Optional subject filter
   * @returns {Array} List of recommended exams
   */
  export const getRecommendedExams = (subject = null) => {
    const exams = [
      { id: 'math-2023', title: 'Mathematics 2023', difficulty: 'Medium', timeEstimate: 40, subject: 'mathematics' },
      { id: 'science-2023', title: 'Science 2023', difficulty: 'Hard', timeEstimate: 30, subject: 'science' },
      { id: 'digiTech-2022', title: 'Digital Technologies 2022', difficulty: 'Easy', timeEstimate: 45, subject: 'digitalTech' },
      { id: 'math-2022', title: 'Mathematics 2022', difficulty: 'Easy', timeEstimate: 40, subject: 'mathematics' },
      { id: 'science-2022', title: 'Science 2022', difficulty: 'Medium', timeEstimate: 30, subject: 'science' }
    ];
    
    return subject ? exams.filter(exam => exam.subject === subject) : exams;
  };
  
  /**
   * Get student progress for subjects
   * @returns {Object} Subject progress percentages
   */
  export const getSubjectProgress = () => {
    return {
      mathematics: 72,
      science: 45,
      digitalTech: 88
    };
  };
  
  /**
   * Get recent activity for a student
   * @returns {Array} List of recent activities
   */
  export const getRecentActivity = () => {
    return [
      { date: '2 days ago', action: 'Completed Mathematics 2022', score: 85 },
      { date: '5 days ago', action: 'Practiced Science (10 questions)', score: 70 },
      { date: '1 week ago', action: 'Started Digital Technologies', score: null }
    ];
  };
  
  /**
   * Get achievements for a student
   * @returns {Array} List of achievements with progress
   */
  export const getAchievements = () => {
    return [
      { title: 'Math Wizard', description: 'Complete 5 Mathematics exams', progress: 3, total: 5 },
      { title: 'Perfect Score', description: 'Get 100% on any exam', progress: 0, total: 1 },
      { title: 'Study Streak', description: '5 days in a row', progress: 2, total: 5 }
    ];
  };
  
  /**
   * Authenticate a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Promise resolving to user data
   */
  export const authenticateUser = async (email, password) => {
    // In a real app, this would make an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo, accept any credentials
    return {
      id: '12345',
      firstName: email.split('@')[0],
      lastName: 'Student',
      email,
      role: 'student',
      trialDaysLeft: 7
    };
  };
  
  /**
   * Calculate results for an exam
   * @param {Object} examData - Exam data with questions
   * @param {Object} answers - User's answers
   * @param {number} timeUsed - Time used in seconds
   * @returns {Object} Calculated results
   */
  export const calculateExamResults = (examData, answers, timeUsed) => {
    // Count correct answers
    const correctCount = examData.questions.reduce((count, question) => {
      return count + (answers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);
    
    // Calculate score as percentage
    const totalQuestions = examData.questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    
    // Group questions by topic
    const topicResults = {};
    const difficultyResults = { easy: {}, medium: {}, hard: {} };
    
    examData.questions.forEach(question => {
      // Initialize topic if not exists
      if (!topicResults[question.topic]) {
        topicResults[question.topic] = {
          total: 0,
          correct: 0,
          incorrect: 0,
          score: 0,
        };
      }
      
      // Count by topic
      topicResults[question.topic].total += 1;
      if (answers[question.id] === question.correctAnswer) {
        topicResults[question.topic].correct += 1;
      } else {
        topicResults[question.topic].incorrect += 1;
      }
      
      // Calculate topic score
      topicResults[question.topic].score = Math.round(
        (topicResults[question.topic].correct / topicResults[question.topic].total) * 100
      );
      
      // Count by difficulty
      if (!difficultyResults[question.difficulty].total) {
        difficultyResults[question.difficulty] = { 
          total: 0, 
          correct: 0,
          score: 0
        };
      }
      
      difficultyResults[question.difficulty].total += 1;
      if (answers[question.id] === question.correctAnswer) {
        difficultyResults[question.difficulty].correct += 1;
      }
      
      // Calculate difficulty score
      difficultyResults[question.difficulty].score = Math.round(
        (difficultyResults[question.difficulty].correct / difficultyResults[question.difficulty].total) * 100
      );
    });
    
    // Determine areas for improvement
    const improvementAreas = Object.entries(topicResults)
      .sort((a, b) => a[1].score - b[1].score)
      .slice(0, 2)
      .map(([topic, data]) => ({
        topic,
        score: data.score,
        recommendation: `Focus on improving your ${topic.toLowerCase()} skills.`
      }));
    
    // Question details with correctness
    const questionDetails = examData.questions.map(question => ({
      ...question,
      isCorrect: answers[question.id] === question.correctAnswer,
      userAnswer: answers[question.id] || null,
    }));
    
    return {
      scorePercentage,
      correctCount,
      totalQuestions,
      timeUsed,
      topicResults,
      difficultyResults,
      improvementAreas,
      questionDetails,
      // Add grade based on score
      grade: getGradeFromScore(scorePercentage),
      // National average comparison (mock data)
      nationalAverage: 72,
      // Time efficiency
      timeEfficiency: calculateTimeEfficiency(timeUsed, examData.timeLimit),
    };
  };
  
  /**
   * Determines letter grade based on percentage score
   * @param {number} score - Percentage score
   * @returns {string} Letter grade (A-E)
   */
  const getGradeFromScore = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
  };
  
  /**
   * Calculates time efficiency description
   * @param {number} timeUsed - Time used in seconds
   * @param {number} timeLimit - Time limit in seconds
   * @returns {string} Efficiency description
   */
  const calculateTimeEfficiency = (timeUsed, timeLimit) => {
    const percentUsed = (timeUsed / timeLimit) * 100;
    
    if (percentUsed < 40) return 'Rushed - Consider using more time';
    if (percentUsed < 70) return 'Efficient - Good time management';
    if (percentUsed < 95) return 'Thorough - Used time well';
    return 'Maximum - Used full available time';
  };