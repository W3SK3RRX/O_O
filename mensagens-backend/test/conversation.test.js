import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { connectTestDb, clearTestDb, closeTestDb } from './db.js';

let app;

beforeAll(async () => {
  await connectTestDb();
  app = (await import('../src/app.js')).default;
});

afterAll(async () => {
  await closeTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

async function makeUser(name) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email: `${name}@test.com`, password: 'secret123' });
  return { id: res.body._id, token: res.body.token };
}

const auth = (t) => ({ Authorization: `Bearer ${t}` });

describe('conversas e autorização', () => {
  it('cria conversa, envia mensagem e conta não-lidas para o outro participante', async () => {
    const alice = await makeUser('alice');
    const bob = await makeUser('bob');

    const conv = await request(app).post('/api/conversations').set(auth(alice.token)).send({ receiverId: bob.id });
    expect([200, 201]).toContain(conv.status);
    const conversationId = conv.body._id;

    const msg = await request(app)
      .post('/api/messages')
      .set(auth(alice.token))
      .send({ conversationId, cipherText: 'AAAA', iv: 'BBBB' });
    expect(msg.status).toBe(201);

    const bobList = await request(app).get('/api/conversations').set(auth(bob.token));
    expect(bobList.status).toBe(200);
    const bobConv = bobList.body.conversations.find((c) => c._id === conversationId);
    expect(bobConv.unreadCount).toBe(1);
  });

  it('nega acesso a mensagens/conversa de quem não participa', async () => {
    const alice = await makeUser('alice');
    const bob = await makeUser('bob');
    const carol = await makeUser('carol');

    const conv = await request(app).post('/api/conversations').set(auth(alice.token)).send({ receiverId: bob.id });
    const conversationId = conv.body._id;

    const msgs = await request(app).get(`/api/messages/${conversationId}`).set(auth(carol.token));
    expect(msgs.status).toBe(403);

    const single = await request(app).get(`/api/conversations/${conversationId}`).set(auth(carol.token));
    expect(single.status).toBe(404);
  });

  it('merge de chaves não apaga a entrada de outro membro', async () => {
    const alice = await makeUser('alice');
    const bob = await makeUser('bob');
    const conv = await request(app).post('/api/conversations').set(auth(alice.token)).send({ receiverId: bob.id });
    const conversationId = conv.body._id;

    await request(app)
      .put(`/api/conversations/${conversationId}/keys`)
      .set(auth(alice.token))
      .send({ encryptedKeys: { [alice.id]: 'kA', [bob.id]: 'kB' }, keyVersion: 1 });

    // Bob grava só a própria entrada, mesma versão → não deve apagar a de Alice.
    await request(app)
      .put(`/api/conversations/${conversationId}/keys`)
      .set(auth(bob.token))
      .send({ encryptedKeys: { [bob.id]: 'kB2' }, keyVersion: 1 });

    const single = await request(app).get(`/api/conversations/${conversationId}`).set(auth(alice.token));
    expect(single.body.encryptedKeys[alice.id]).toBe('kA');
    expect(single.body.encryptedKeys[bob.id]).toBe('kB2');
  });

  it('rejeita ObjectId inválido com 4xx (não 500)', async () => {
    const alice = await makeUser('alice');
    const res = await request(app).get('/api/conversations/nao-e-objectid').set(auth(alice.token));
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});
