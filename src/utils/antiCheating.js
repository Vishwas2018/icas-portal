/**
 * Anti-cheating utility for the ICAS exam system
 * 
 * Provides functions to detect and prevent cheating behaviors during online exams,
 * including tab switching, keyboard shortcuts, and browser navigation.
 */

// Common keyboard shortcuts used for cheating
const MONITORED_SHORTCUTS = {
    // Copy, paste, print
    'ctrl+c': true,
    'ctrl+v': true,
    'ctrl+p': true,
    'meta+c': true, 
    'meta+v': true,
    'meta+p': true,
    // Search, developer tools
    'ctrl+f': true,
    'f12': true,
    'ctrl+shift+i': true,
    'meta+alt+i': true,
    // Tab and window management
    'alt+tab': true,
    'ctrl+n': true,
    'ctrl+t': true,
    'meta+n': true,
    'meta+t': true,
  };
  
  /**
   * Sets up anti-cheating measures for an exam session
   * 
   * @param {Object} options - Configuration options
   * @param {Function} options.onTabSwitch - Callback when tab switching is detected
   * @param {Function} options.onWindowBlur - Callback when window loses focus
   * @param {Function} options.onKeyboardShortcut - Callback when monitored keyboard shortcut is used
   * @param {Function} options.onContextMenu - Callback for right-click context menu
   * @returns {Object} Handler references for cleanup
   */
  export const setupAntiCheating = (options = {}) => {
    const {
      onTabSwitch = () => {},
      onWindowBlur = () => {},
      onKeyboardShortcut = () => {},
      onContextMenu = (e) => e.preventDefault(),
    } = options;
    
    // Track visibility changes (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onTabSwitch();
        logCheatingAttempt('Tab switching detected');
      }
    };
    
    // Track window focus
    const handleWindowBlur = () => {
      onWindowBlur();
      logCheatingAttempt('Window focus lost');
    };
    
    // Track keyboard shortcuts
    const handleKeyDown = (e) => {
      // Build key combination string (e.g., 'ctrl+c')
      const key = e.key.toLowerCase();
      const ctrlKey = e.ctrlKey ? 'ctrl+' : '';
      const metaKey = e.metaKey ? 'meta+' : '';
      const shiftKey = e.shiftKey ? 'shift+' : '';
      const altKey = e.altKey ? 'alt+' : '';
      
      const combination = `${ctrlKey}${metaKey}${shiftKey}${altKey}${key}`;
      
      // Check if this is a monitored shortcut
      if (MONITORED_SHORTCUTS[combination] || MONITORED_SHORTCUTS[key]) {
        e.preventDefault();
        onKeyboardShortcut(combination);
        logCheatingAttempt(`Keyboard shortcut detected: ${combination}`);
        return false;
      }
    };
    
    // Prevent back/forward navigation
    const handleBackNavigation = (e) => {
      if (e.state !== null) {
        e.preventDefault();
        history.pushState(null, '', window.location.href);
        logCheatingAttempt('Browser navigation attempted');
      }
    };
    
    // Disable browser context menu (right-click)
    const handleContextMenu = (e) => {
      onContextMenu(e);
      logCheatingAttempt('Context menu opened');
    };
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handleBackNavigation);
    document.addEventListener('contextmenu', handleContextMenu);
    
    // Push initial state to prevent back navigation
    history.pushState(null, '', window.location.href);
    
    // Return handlers for cleanup
    return {
      handleVisibilityChange,
      handleWindowBlur,
      handleKeyDown,
      handleBackNavigation,
      handleContextMenu,
    };
  };
  
  /**
   * Cleans up anti-cheating event listeners
   * 
   * @param {Object} handlers - Handler references from setupAntiCheating
   */
  export const cleanupAntiCheating = (handlers) => {
    if (!handlers) return;
    
    const {
      handleVisibilityChange,
      handleWindowBlur,
      handleKeyDown,
      handleBackNavigation,
      handleContextMenu,
    } = handlers;
    
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    document.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('popstate', handleBackNavigation);
    document.removeEventListener('contextmenu', handleContextMenu);
  };
  
  /**
   * Logs cheating attempts for review
   * 
   * @param {string} activity - Description of the suspicious activity
   */
  export const logCheatingAttempt = (activity) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      activity,
      url: window.location.href,
    };
    
    // Get existing logs from localStorage
    const existingLogs = JSON.parse(localStorage.getItem('cheating_logs') || '[]');
    
    // Add new log entry
    existingLogs.push(logEntry);
    
    // Save back to localStorage
    localStorage.setItem('cheating_logs', JSON.stringify(existingLogs));
    
    // In a production environment, this could also send the data to a server
    console.warn(`[CHEATING ATTEMPT] ${timestamp}: ${activity}`);
  };
  
  /**
   * Checks if the user has any previous cheating attempts
   * 
   * @returns {Object} Stats about cheating attempts
   */
  export const getCheatingStats = () => {
    const logs = JSON.parse(localStorage.getItem('cheating_logs') || '[]');
    
    return {
      totalAttempts: logs.length,
      recentAttempts: logs.filter(log => {
        const timestamp = new Date(log.timestamp);
        const now = new Date();
        // Get attempts in the last 24 hours
        return (now - timestamp) < 24 * 60 * 60 * 1000;
      }).length,
      hasCheated: logs.length > 0,
    };
  };
  
  /**
   * Clears cheating logs (typically done after review)
   */
  export const clearCheatingLogs = () => {
    localStorage.removeItem('cheating_logs');
  };