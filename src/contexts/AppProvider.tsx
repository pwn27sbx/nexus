import React from 'react';
import { AuthProvider } from './AuthContext';
import { ModalProvider } from './ModalContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ModalProvider>{children}</ModalProvider>
    </AuthProvider>
  );
};
