import React, { createContext, useState, useContext, useEffect } from 'react';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('analyze'); // 'analyze', 'compare', 'trends'

  // Load from localStorage on mount
  useEffect(() => {
    const savedQuery = localStorage.getItem('globalSearchQuery');
    const savedMode = localStorage.getItem('globalSearchMode');
    if (savedQuery) {
      setSearchQuery(savedQuery);
    }
    if (savedMode) {
      setSearchMode(savedMode);
    }
  }, []);

  const updateSearch = (query, mode = 'analyze') => {
    setSearchQuery(query);
    setSearchMode(mode);
    localStorage.setItem('globalSearchQuery', query);
    localStorage.setItem('globalSearchMode', mode);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchMode('analyze');
    localStorage.removeItem('globalSearchQuery');
    localStorage.removeItem('globalSearchMode');
  };

  return (
    <SearchContext.Provider value={{
      searchQuery,
      searchMode,
      updateSearch,
      clearSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
};