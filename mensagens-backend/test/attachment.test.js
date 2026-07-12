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

// Consome o corpo binário da resposta como Buffer (octet-stream).
function downloadBinary(id, token) {
  return request(app)
    .get(`/api/attachments/${id}`)
    .set(auth(token))
    .buffer(true)
    .parse((res, callback) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => callback(null, Buffer.concat(chunks)));
    });
}

async function makeConversation() {
  const alice = await makeUser('alice');
  const bob = await makeUser('bob');
  const conv = await request(app)
    .post('/api/conversations')
    .set(auth(alice.token))
    .send({ receiverId: bob.id });
  return { alice, bob, conversationId: conv.body._id };
}

describe('anexos: upload/download binário e autorização', () => {
  it('faz round-trip do ciphertext binário (upload octet-stream → download idêntico)', async () => {
    const { alice, conversationId } = await makeConversation();
    const cipher = Buffer.from([0, 1, 2, 250, 251, 252, 253, 254, 255]);

    const up = await request(app)
      .post('/api/attachments')
      .set(auth(alice.token))
      .set('Content-Type', 'application/octet-stream')
      .query({ conversationId, name: 'foto.webp', mime: 'image/webp' })
      .send(cipher);

    expect(up.status).toBe(201);
    expect(up.body.size).toBe(cipher.length);
    expect(up.body.mime).toBe('image/webp');
    expect(up.body.name).toBe('foto.webp');

    const dl = await downloadBinary(up.body.attachmentId, alice.token);
    expect(dl.status).toBe(200);
    expect(dl.headers['content-type']).toContain('application/octet-stream');
    expect(Buffer.isBuffer(dl.body)).toBe(true);
    expect(Buffer.compare(dl.body, cipher)).toBe(0);
  });

  it('rejeita corpo vazio com 4xx', async () => {
    const { alice, conversationId } = await makeConversation();
    const res = await request(app)
      .post('/api/attachments')
      .set(auth(alice.token))
      .set('Content-Type', 'application/octet-stream')
      .query({ conversationId })
      .send(Buffer.alloc(0));
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('rejeita conversationId inválido com 4xx (validação da query)', async () => {
    const { alice } = await makeConversation();
    const res = await request(app)
      .post('/api/attachments')
      .set(auth(alice.token))
      .set('Content-Type', 'application/octet-stream')
      .query({ conversationId: 'nao-e-objectid' })
      .send(Buffer.from([1, 2, 3]));
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('nega upload em conversa de que o usuário não participa', async () => {
    const { conversationId } = await makeConversation();
    const carol = await makeUser('carol');
    const res = await request(app)
      .post('/api/attachments')
      .set(auth(carol.token))
      .set('Content-Type', 'application/octet-stream')
      .query({ conversationId })
      .send(Buffer.from([1, 2, 3]));
    expect(res.status).toBe(403);
  });

  it('nega download de anexo de conversa alheia', async () => {
    const { alice, conversationId } = await makeConversation();
    const carol = await makeUser('carol');
    const up = await request(app)
      .post('/api/attachments')
      .set(auth(alice.token))
      .set('Content-Type', 'application/octet-stream')
      .query({ conversationId })
      .send(Buffer.from([9, 9, 9]));

    const dl = await downloadBinary(up.body.attachmentId, carol.token);
    expect(dl.status).toBe(403);
  });
});
