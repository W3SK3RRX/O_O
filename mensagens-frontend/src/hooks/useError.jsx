import { useState, useCallback } from 'react';

/**
 * Hook para gerenciamento global de erros e notificações
 * @returns {{ error: string|null, showError: (message: string) => void, clearError: () => void }}
 */
export function useError() {
  const [error, setError] = useState(null);

  const showError = useCallback((message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, showError, clearError };
}
