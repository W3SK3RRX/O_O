// Backfill idempotente das leituras (campo `reads` da Conversation).
//
// Ao introduzir as não lidas persistentes, nenhuma conversa tem `reads`, então
// todo o histórico contaria como não lido. Este script marca todos os
// participantes como tendo lido "agora", zerando o passado. A contagem passa a
// valer a partir daqui. Só preenche participantes que ainda não têm entrada,
// então pode ser reexecutado sem efeito colateral.
//
// Uso: node scripts/backfill-reads.js

import 'dotenv/config';
import mongoose from 'mongoose';
import connectDatabase from '../src/config/database.js';
import Conversation from '../src/models/Conversation.js';
import log from '../src/config/logger.js';

const run = async () => {
  await connectDatabase();

  const now = new Date();
  const cursor = Conversation.find({}).cursor();

  let scanned = 0;
  let updated = 0;

  for (let conv = await cursor.next(); conv != null; conv = await cursor.next()) {
    scanned += 1;
    let changed = false;

    for (const participant of conv.participants) {
      const key = participant.toString();
      if (!conv.reads.has(key)) {
        conv.reads.set(key, now);
        changed = true;
      }
    }

    if (changed) {
      await conv.save();
      updated += 1;
    }
  }

  log.info({ scanned, updated }, 'Backfill de reads concluído');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  log.fatal({ err }, 'Falha no backfill de reads');
  process.exit(1);
});
