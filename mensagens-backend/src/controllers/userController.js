import User from '../models/User.js';
import log from '../config/logger.js';
import { encryptKeyBackup, decryptKeyBackup } from '../utils/keyBackupCipher.js';
import { NotFoundError, UnauthorizedError, ValidationError } from '../middlewares/errorClasses.js';
import { generateAccessToken, generateRefreshToken, setRefreshCookie } from '../utils/tokens.js';

export const searchUsers = async (req, res) => {
  const search = req.validatedQuery.search;
  const currentUserId = req.user._id;

  // Escapa metacaracteres e ancora no início (prefixo): usa índice e evita ReDoS.
  const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const prefix = new RegExp(`^${safeSearch}`, 'i');

  const users = await User.find({
    $or: [{ name: prefix }, { email: prefix }],
    _id: { $ne: currentUserId },
  })
    .select('name email avatar publicKey')
    .limit(20)
    .lean();

  res.json(users);
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('name email avatar publicKey role isAdmin privateKeyBackup')
    .lean();

  if (!user) throw new NotFoundError('Usuário');

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    publicKey: user.publicKey,
    hasPrivateKeyBackup: !!user.privateKeyBackup,
    role: user.role,
    isAdmin: user.isAdmin,
  });
};

export const updatePublicKey = async (req, res) => {
  const userId = req.user._id;
  const { publicKey } = req.validatedBody || req.body;

  if (!publicKey) throw new ValidationError('Chave pública é obrigatória');

  await User.findByIdAndUpdate(userId, { publicKey });
  log.info({ userId }, 'Chave pública atualizada');
  res.status(200).json({ message: 'Chave pública atualizada com sucesso' });
};

export const updateKeyPair = async (req, res) => {
  const userId = req.user._id;
  const { publicKey, privateKeyBackup } = req.validatedBody || req.body;

  const encryptedPrivateKeyBackup = encryptKeyBackup(privateKeyBackup);

  await User.findByIdAndUpdate(userId, {
    publicKey,
    privateKeyBackup: encryptedPrivateKeyBackup,
  });

  log.info({ userId }, 'Par de chaves atualizado');
  res.status(200).json({ message: 'Par de chaves atualizado com sucesso' });
};

export const changePassword = async (req, res) => {
  const { currentPassword, password } = req.validatedBody || req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('Usuário');

  // Exige a senha atual: impede tomada de conta com um token/sessão vazado.
  if (!currentPassword || !(await user.matchPassword(currentPassword))) {
    throw new UnauthorizedError('Senha atual incorreta');
  }

  user.password = password;
  // Revoga todas as sessões antigas (outros dispositivos) ao trocar a senha.
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  await user.save();

  // Reemite tokens para o dispositivo atual continuar logado.
  const token = generateAccessToken(user);
  setRefreshCookie(res, generateRefreshToken(user));

  log.info({ userId }, 'Senha alterada com sucesso');
  res.status(200).json({ message: 'Senha alterada com sucesso', token });
};

export const getPrivateKeyBackup = async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).select('privateKeyBackup publicKey').lean();

  if (!user || !user.privateKeyBackup) {
    throw new NotFoundError('Backup da chave privada');
  }

  const privateKeyBackup = decryptKeyBackup(user.privateKeyBackup);
  res.status(200).json({ privateKeyBackup, publicKey: user.publicKey });
};
