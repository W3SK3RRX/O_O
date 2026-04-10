import { createContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth.api';
import * as userApi from '../api/user.api';
import { saveKeys, loadKeys } from '../crypto/storage';
import { generateKeyPair, exportPublicKey } from '../crypto/keys';

export const AuthContext = createContext();

// Função auxiliar para lidar com a criptografia
// Declarada antes do useEffect para evitar hoisting
const setupEncryption = async () => {
  try {
    // 1. Gera o par de chaves localmente
    const keys = await generateKeyPair();
    // 2. Salva no IndexedDB
    await saveKeys(keys);
    
    // 3. Exporta a chave pública e envia para o Backend
    const exportedPublicKey = await exportPublicKey(keys.publicKey);
    await userApi.updatePublicKey(exportedPublicKey);
    
    console.log("🔐 Criptografia configurada e chave pública sincronizada.");
  } catch (error) {
    console.error("Erro ao configurar criptografia:", error);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
        
        const keys = await loadKeys();
        if (!keys) {
          console.log("Usuário logado sem chaves locais. Gerando...");
          await setupEncryption();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('token', data.token);
    setUser(data);

    const keys = await loadKeys();
    if (!keys) {
      await setupEncryption();
    }
  };

  const register = async (name, email, password) => {
    const data = await authApi.register({ name, email, password });
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('token', data.token);
    setUser(data);

    await setupEncryption();
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
