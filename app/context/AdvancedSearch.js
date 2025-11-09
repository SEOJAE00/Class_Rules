'use client'

import { createContext, useContext, useState } from 'react';

const AdvancedSearchContext = createContext();

export function AdvancedSearchProvider({ children }) {
  // 1. 상세 검색 결과 (HTML 객체)를 저장할 state
  const [advSearchResults, setAdvSearchResults] = useState(null);
  
  // 2. 상세 검색 키워드를 저장할 state
  const [advSearchKeyword, setAdvSearchKeyword] = useState('');

  const value = {
    advSearchResults,
    setAdvSearchResults,
    advSearchKeyword,
    setAdvSearchKeyword
  };

  return (
    <AdvancedSearchContext.Provider value={value}>
      {children}
    </AdvancedSearchContext.Provider>
  );
}

// 3. 사용하기 편한 custom hook
export function useAdvancedSearch() {
  return useContext(AdvancedSearchContext);
}