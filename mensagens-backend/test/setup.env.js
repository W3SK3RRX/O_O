// Roda antes de cada arquivo de teste (setupFiles), ANTES de env.js ser importado.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-1234567890';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-1234567890';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.LOG_LEVEL = 'error';
process.env.VAPID_PUBLIC_KEY = 'test-vapid-public';
process.env.VAPID_PRIVATE_KEY = 'test-vapid-private';
process.env.VAPID_SUBJECT = 'mailto:test@test.com';
// Placeholder — a conexão real usa a URI do mongodb-memory-server (test/db.js).
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/test';
