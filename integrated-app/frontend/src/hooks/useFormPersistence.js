import { useState, useEffect } from 'react';

/**
 * Custom hook to persist form data in localStorage
 * @param {string} key - The localStorage key to use for this form
 * @param {object} initialValue - The initial state value
 * @param {boolean} saveOnChange - Whether to save on every change (true) or manually (false)
 * @returns {Array} [state, setState, persistData, clearPersistedData]
 */
const useFormPersistence = (key, initialValue, saveOnChange = true) => {
  // Get initial state from localStorage or use initialValue
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item && item !== 'undefined') {
        const parsedItem = JSON.parse(item);
        // Check if the data is still valid (not expired)
        if (parsedItem && parsedItem.expiry && new Date(parsedItem.expiry) > new Date()) {
          return parsedItem.data;
        }
      }
      return initialValue;
    } catch (error) {
      console.error('Error loading persisted form data:', error);
      return initialValue;
    }
  });

  // Persist data to localStorage whenever state changes (if saveOnChange is true)
  useEffect(() => {
    if (saveOnChange) {
      try {
        // Set expiration time to 24 hours from now
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        
        const serializedData = JSON.stringify({
          data: state,
          expiry: expiry.toISOString(),
        });
        window.localStorage.setItem(key, serializedData);
      } catch (error) {
        console.error('Error saving form data to localStorage:', error);
      }
    }
  }, [key, state, saveOnChange]);

  // Function to manually persist data
  const persistData = () => {
    try {
      // Set expiration time to 24 hours from now
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24);
      
      const serializedData = JSON.stringify({
        data: state,
        expiry: expiry.toISOString(),
      });
      window.localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }
  };

  // Function to clear persisted data
  const clearPersistedData = () => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing persisted form data:', error);
    }
  };

  return [state, setState, persistData, clearPersistedData];
};

export default useFormPersistence; 