'use client'

import { createContext, useContext, useState } from 'react';

const SelectedFileContext = createContext();

export const SelectedFileProvider = ({ children }) => {

  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [sociNumber, setSociNumber] = useState('');

  const value = {
    selectedFilePath,
    setSelectedFilePath,
    sociNumber,
    setSociNumber
  };

  return (
    <SelectedFileContext.Provider value={value}>
      {children}
    </SelectedFileContext.Provider>
  );
};

export const useSelectedFile = () => {
  const context = useContext(SelectedFileContext);
  if (context === undefined) {
    throw new Error('useSelectedFile must be used within a SelectedFileProvider');
  }
  return context;
};