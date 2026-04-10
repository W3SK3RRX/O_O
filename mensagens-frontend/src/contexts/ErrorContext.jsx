import { createContext, useContext } from 'react';
import { useState, useCallback } from 'react';

const ErrorContext = createContext(null);

/**
 * Provider para gerenciamento global de erros e notificações
 */
export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);

  const showError = useCallback((message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
}

/**
 * Hook para usar o contexto de erros
 */
export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError deve ser usado dentro de ErrorProvider');
  }
  return context;
}
