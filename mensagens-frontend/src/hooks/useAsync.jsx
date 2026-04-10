import { useState, useCallback } from 'react';

/**
 * Hook genérico para gerenciar estados de loading e erro
 * @param {() => Promise<any>} asyncCallback - Função assíncrona a ser executada
 */
export function useAsync(asyncCallback) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncCallback(...args);
      setData(result);
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Erro desconhecido';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncCallback]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * Hook para mutations (POST, PUT, PATCH, DELETE)
 */
export function useMutation(onSuccess) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (asyncCallback) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncCallback();
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Erro desconhecido';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { mutate, loading, error };
}
