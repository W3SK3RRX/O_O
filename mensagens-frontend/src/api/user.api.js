import api from './axios';

export const searchUsers = async (query) => {
  if (!query.trim()) return [];
  // AJUSTE: O backend espera ?search= e não ?query= (conforme o controller que criamos)
  const { data } = await api.get(`/users/search?search=${query}`);
  return data;
};

// Mantido conforme sua solicitação
export const changePassword = (password) => {
  return api.post('/users/change-password', { password });
};

// Função essencial para o E2EE (Criptografia)
export const updatePublicKey = async (publicKey) => {
  const { data } = await api.patch('/users/public-key', {
    publicKey
  });
  return data;
};

// Mantivemos o getProfile pois o AuthContext precisa dele para carregar o usuário
export const getProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data;
};