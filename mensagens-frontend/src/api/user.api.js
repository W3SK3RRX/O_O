import api from './axios';

export const searchUsers = async (query) => {
  if (!query.trim()) return [];
  // Backend espera ?search= ; usa params para fazer o encode corretamente
  const { data } = await api.get('/users/search', { params: { search: query } });
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

export const updateKeyPair = async (publicKey, privateKeyBackup) => {
  const { data } = await api.patch('/users/key-pair', {
    publicKey,
    privateKeyBackup
  });
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data;
};
export const getKeyBackup = async () => {
  const { data } = await api.get('/users/key-backup');
  return data;
};
