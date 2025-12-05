import { useState, useEffect } from 'react';
import { Diamond } from '../types';

interface ComparisonState {
  diamonds: Diamond[];
  isVisible: boolean;
}

export const useComparison = () => {
  const [comparison, setComparison] = useState<ComparisonState>({
    diamonds: [],
    isVisible: false
  });

  // Load comparison from localStorage on mount
  useEffect(() => {
    const savedComparison = localStorage.getItem('diamondComparison');
    if (savedComparison) {
      try {
        const parsed = JSON.parse(savedComparison);
        // Check if data is still valid (less than 24 hours)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setComparison({
            diamonds: parsed.diamonds || [],
            isVisible: false
          });
        } else {
          // Clear old comparison data
          localStorage.removeItem('diamondComparison');
        }
      } catch (error) {
        console.error('Error loading comparison data:', error);
        localStorage.removeItem('diamondComparison');
      }
    }
  }, []);

  // Save comparison to localStorage whenever it changes
  useEffect(() => {
    if (comparison.diamonds.length > 0) {
      localStorage.setItem('diamondComparison', JSON.stringify({
        diamonds: comparison.diamonds,
        timestamp: Date.now()
      }));
    } else {
      localStorage.removeItem('diamondComparison');
    }
  }, [comparison.diamonds]);

  const addToComparison = (diamond: Diamond) => {
    setComparison(prev => {
      // Check if diamond already exists
      if (prev.diamonds.some(d => d._id === diamond._id)) {
        return prev;
      }

      // Check if maximum limit reached
      if (prev.diamonds.length >= 4) {
        throw new Error('Maximum 4 diamonds can be compared at once');
      }

      return {
        ...prev,
        diamonds: [...prev.diamonds, diamond],
        isVisible: true
      };
    });
  };

  const removeFromComparison = (diamondId: string) => {
    setComparison(prev => ({
      ...prev,
      diamonds: prev.diamonds.filter(d => d._id !== diamondId),
      isVisible: prev.diamonds.length > 1 // Keep visible if there are still diamonds
    }));
  };

  const clearComparison = () => {
    setComparison({
      diamonds: [],
      isVisible: false
    });
  };

  const isInComparison = (diamondId: string) => {
    return comparison.diamonds.some(d => d._id === diamondId);
  };

  const getComparisonCount = () => comparison.diamonds.length;

  const showComparison = () => {
    if (comparison.diamonds.length > 0) {
      setComparison(prev => ({ ...prev, isVisible: true }));
    }
  };

  return {
    diamonds: comparison.diamonds,
    isVisible: comparison.isVisible,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    getComparisonCount,
    showComparison
  };
};