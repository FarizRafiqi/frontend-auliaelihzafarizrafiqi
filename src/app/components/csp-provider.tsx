"use client";

import React, { useEffect } from 'react';

interface CSPProviderProps {
  children: React.ReactNode;
}

const CSPProvider: React.FC<CSPProviderProps> = ({ children }) => {
  useEffect(() => {
    const handleCSPViolation = (event: SecurityPolicyViolationEvent) => {
      console.warn('CSP Violation:', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
      });
    };

    document.addEventListener('securitypolicyviolation', handleCSPViolation);

    return () => {
      document.removeEventListener('securitypolicyviolation', handleCSPViolation);
    };
  }, []);

  return <>{children}</>;
};

export default CSPProvider; 