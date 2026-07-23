import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

import { LazyMotion, domAnimation } from 'framer-motion';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <>
        <LazyMotion features={domAnimation}>{children}</LazyMotion>
      </>
    </AuthProvider>
  );
};
