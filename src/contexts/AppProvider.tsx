import React from 'react';
import { AuthProvider } from './AuthContext';
import { ModalProvider } from './ModalContext';

import { LazyMotion, domAnimation } from 'framer-motion';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ModalProvider>
        <LazyMotion features={domAnimation}>{children}</LazyMotion>
      </ModalProvider>
    </AuthProvider>
  );
};
