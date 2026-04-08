import { useState } from 'react';

export const useButtonLoading = () => {
  const [loadingStates, setLoadingStates] = useState({});

  const setLoading = (key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  const isLoading = (key) => {
    return loadingStates[key] || false;
  };

  const withLoading = (key, asyncFunction) => {
    return async (...args) => {
      if (isLoading(key)) return;
      
      setLoading(key, true);
      try {
        return await asyncFunction(...args);
      } finally {
        setLoading(key, false);
      }
    };
  };

  return { setLoading, isLoading, withLoading };
};