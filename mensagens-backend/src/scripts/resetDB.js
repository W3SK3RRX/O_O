import mongoose from 'mongoose';
import dotenv from 'dotenv';
// Ajuste os caminhos conforme sua estrutura
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

dotenv.config();

const resetDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado ao MongoDB...');

    await User.deleteMany({});
    console.log('Usuários deletados.');

    await Message.deleteMany({});
    console.log('Mensagens deletadas.');

    await Conversation.deleteMany({});
    console.log('Conversas deletadas.');

    console.log('BANCO DE DADOS LIMPO COM SUCESSO!');
    process.exit();
  } catch (error) {
    console.error('Erro ao limpar banco:', error);
    process.exit(1);
  }
};

resetDb();