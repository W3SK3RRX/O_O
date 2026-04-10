import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const updateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Conectado ao MongoDB...');

    const userModule = await import('../models/User.js');
    const User = userModule.default;

    const result = await User.updateMany(
      { active: { $exists: false } },
      { $set: { active: true } }
    );

    console.log(`✅ ${result.modifiedCount} usuários atualizados para active: true`);

    process.exit();
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

updateUsers();
