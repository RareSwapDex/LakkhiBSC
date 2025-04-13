import { useEffect } from 'react';

/**
 * Custom hook for setting the document title
 * @param {string} title - The title to set for the page
 * @param {boolean} resetOnUnmount - Whether to reset the title when the component unmounts
 */
const useDocumentTitle = (title, resetOnUnmount = false) => {
  // Store the original title
  const originalTitle = document.title;
  
  useEffect(() => {
    // Set the document title when the component mounts
    document.title = title;
    
    // Reset the document title when the component unmounts (if specified)
    return () => {
      if (resetOnUnmount) {
        document.title = originalTitle;
      }
    };
  }, [title, originalTitle, resetOnUnmount]);
};

export default useDocumentTitle; 