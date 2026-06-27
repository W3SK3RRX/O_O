import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js'; // Importação atualizada para ESM

dotenv.config();

/**
 * Cria um usuário se ainda não existir. As credenciais vêm de variáveis de
 * ambiente — nada de senha hardcoded no repositório. Sem senha definida, a
 * criação é pulada (não usamos default fraco).
 */
const ensureUser = async ({ name, email, password, isAdmin = false }) => {
  const label = isAdmin ? 'ADMIN' : 'usuário';

  if (!email || !password) {
    console.log(`⏭️  ${label} pulado: defina email e senha via env (ver .env.example).`);
    return;
  }

  if (await User.findOne({ email })) {
    console.log(`⚠️  ${label} já existe: ${email}`);
    return;
  }

  await User.create({
    name: name || email,
    email,
    password, // hashada automaticamente pelo Model
    role: isAdmin ? 'admin' : 'user',
    isAdmin,
    avatar: '',
    publicKey: null, // gerada no primeiro login pelo Frontend
  });
  console.log(`✅ ${label} criado: ${email}`);
};

const createUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Conectado ao MongoDB...');

    await ensureUser({
      name: process.env.SEED_ADMIN_NAME,
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
      isAdmin: true,
    });

    await ensureUser({
      name: process.env.SEED_TEST_NAME,
      email: process.env.SEED_TEST_EMAIL,
      password: process.env.SEED_TEST_PASSWORD,
      isAdmin: false,
    });

    console.log('🏁 Processo finalizado.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
    process.exit(1);
  }
};

createUsers();
