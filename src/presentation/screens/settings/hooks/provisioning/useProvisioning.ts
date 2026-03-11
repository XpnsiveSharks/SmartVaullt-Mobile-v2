import React, { createContext, useContext, useState } from 'react';

interface ProvisioningContextValue {
  log: string;
  setLog: (log: string) => void;
}

const ProvisioningContext = createContext<ProvisioningContextValue | null>(null);

export const ProvisioningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [log, setLog] = useState('');

  return React.createElement(
    ProvisioningContext.Provider,
    { value: { log, setLog } },
    children
  );
};

export function useProvisioning() {
  const context = useContext(ProvisioningContext);
  if (!context) {
    throw new Error('useProvisioning must be used within a ProvisioningProvider');
  }
  return context;
}
