const request = require('supertest');
const app = require('../server');
const { initDb } = require('../config/db');

beforeAll(async () => {
  await initDb();
});

describe('SmartAttend API Integration Tests', () => {
  test('GET /api/health returns 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('SmartAttend API');
  });

  test('POST /api/auth/login rejects invalid credentials with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@smartattend.edu', password: 'wrong' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('Protected routes reject requests missing Bearer token with 401', async () => {
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
