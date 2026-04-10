import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js'; // Importação atualizada para ESM

dotenv.config();

const createUsers = async () => {
  try {
    // Conecta ao banco
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Conectado ao MongoDB...');

    // --- CRIAR ADMIN ---
    const adminEmail = 'admin@admin.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        name: 'Administrador',
        email: adminEmail,
        password: '123', // A senha será hashada automaticamente pelo Model
        role: 'admin',
        isAdmin: true,
        avatar: '',
        publicKey: null // Será gerada no primeiro login pelo Frontend
      });
      console.log('✅ Usuário ADMIN criado: admin@admin.com / 123');
    } else {
      console.log('⚠️ Usuário ADMIN já existe.');
    }

    // --- CRIAR USUÁRIO TESTE ---
    const testEmail = 'teste@teste.com';
    const testUserExists = await User.findOne({ email: testEmail });

    if (!testUserExists) {
      await User.create({
        name: 'Usuário Teste',
        email: testEmail,
        password: '123',
        isAdmin: false,
        avatar: '',
        publicKey: null // Será gerada no primeiro login pelo Frontend
      });
      console.log('✅ Usuário TESTE criado: teste@teste.com / 123');
    } else {
      console.log('⚠️ Usuário TESTE já existe.');
    }

    console.log('🏁 Processo finalizado.');
    process.exit();

  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
    process.exit(1);
  }
};

createUsers();