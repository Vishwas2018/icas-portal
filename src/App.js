// Stylesheets
import './styles/global.css';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import ExamInterface from './components/Exam/ExamInterface';
import ExamResults from './components/Results/ExamResults';
import Footer from './components/Common/Footer';
import Header from './components/Common/Header';
import Login from './components/Auth/Login';
import NotFound from './components/Common/NotFound';
import React from 'react';
// Components
import StudentDashboard from './components/Dashboard/StudentDashboard';

/**
 * Protected Route component
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

/**
 * Main app layout with Header and Footer
 */
const AppLayout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div className="app">
      <Header 
        user={user}
        onLogout={logout}
        isAuthenticated={isAuthenticated}
      />
      
      <main className="main-content">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

/**
 * Main App component
 */
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/exam/:examId" 
              element={
                <ProtectedRoute>
                  <ExamInterface />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/exam/:examId/results" 
              element={
                <ProtectedRoute>
                  <ExamResults />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect from home to dashboard if authenticated, otherwise to login */}
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />} 
            />
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
};

/**
 * Public Route component
 * Redirects to dashboard if already authenticated
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default App;