import { FiArrowLeft, FiHome } from 'react-icons/fi';

import { Link } from 'react-router-dom';
import React from 'react';

/**
 * Not Found (404) page component
 * Displayed when a user tries to access a non-existent route
 */
const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-actions">
          <button className="action-button" onClick={() => window.history.back()}>
            <FiArrowLeft /> Go Back
          </button>
          <Link to="/" className="action-button primary">
            <FiHome /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;