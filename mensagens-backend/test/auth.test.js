import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { connectTestDb, clearTestDb, closeTestDb } from './db.js';

let app;
let User;

beforeAll(async () => {
  await connectTestDb();
  app = (await import('../src/app.js')).default;
  User = (await import('../src/models/User.js')).default;
});

afterAll(async () => {
  await closeTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

const register = (over = {}) =>
  request(app).post('/api/auth/register').send({
    name: 'Alice',
    email: 'alice@test.com',
    password: 'secret123',
    ...over,
  });

describe('auth', () => {
  it('registra e devolve access token + cookie httpOnly de refresh', async () => {
    const res = await register();
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.refreshToken).toBeUndefined(); // refresh NÃO vai no corpo
    const cookies = res.headers['set-cookie'] || [];
    const refresh = cookies.find((c) => c.startsWith('refreshToken='));
    expect(refresh).toBeTruthy();
    expect(refresh).toMatch(/HttpOnly/i);
  });

  it('rejeita login com senha errada', async () => {
    await register();
    const res = await request(app).post('/api/auth/login').send({ email: 'alice@test.com', password: 'errada' });
    expect(res.status).toBe(401);
  });

  it('bloqueia login de usuário desativado (403)', async () => {
    await register();
    await User.updateOne({ email: 'alice@test.com' }, { active: false });
    const res = await request(app).post('/api/auth/login').send({ email: 'alice@test.com', password: 'secret123' });
    expect(res.status).toBe(403);
  });

  it('renova o access token usando o cookie de refresh', async () => {
    const reg = await register();
    const cookie = reg.headers['set-cookie'];
    const res = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('invalida refresh após bump de tokenVersion (revogação)', async () => {
    const reg = await register();
    const cookie = reg.headers['set-cookie'];
    await User.updateOne({ email: 'alice@test.com' }, { $inc: { tokenVersion: 1 } });
    const res = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(res.status).toBe(401);
  });

  it('não aceita refresh token como credencial de rota protegida', async () => {
    const reg = await register();
    // Extrai o valor do refresh do cookie e tenta usá-lo como Bearer
    const cookie = (reg.headers['set-cookie'] || []).find((c) => c.startsWith('refreshToken='));
    const refreshVal = cookie.split(';')[0].split('=')[1];
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${refreshVal}`);
    expect(res.status).toBe(401);
  });

  it('/auth/me funciona com access token válido', async () => {
    const reg = await register();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${reg.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('alice@test.com');
  });

  it('logout limpa o cookie de refresh', async () => {
    const reg = await register();
    const res = await request(app).post('/api/auth/logout').set('Cookie', reg.headers['set-cookie']);
    expect(res.status).toBe(200);
    const cleared = (res.headers['set-cookie'] || []).find((c) => c.startsWith('refreshToken='));
    expect(cleared).toMatch(/refreshToken=;/);
  });
});
