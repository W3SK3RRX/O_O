import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Conectado ao MongoDB...');

    // Dynamic import do User model
    const userModule = await import('../models/User.js');
    const User = userModule.default;

    const result = await User.updateOne(
      { email: 'admin@admin.com' },
      { $set: { role: 'admin', isAdmin: true } }
    );

    console.log(`✅ Usuário admin atualizado! Modified: ${result.modifiedCount}`);

    const admin = await User.findOne({ email: 'admin@admin.com' });
    console.log('📋 Dados do admin:', {
      email: admin.email,
      role: admin.role,
      isAdmin: admin.isAdmin
    });

    process.exit();
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

updateAdmin();
