import React, { createContext, useState, useContext, ReactNode } from 'react';

interface LoadingContextData {
  loading: boolean;
  setLoading: (state: boolean) => void;
}

interface LoadingProviderProps {
  children: ReactNode; // Certifique-se de que este tipo é ReactNode
}

const LoadingContext = createContext<LoadingContextData>({
  loading: false,
  setLoading: () => {},
});

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
