import request from 'supertest';
import { jest } from '@jest/globals';
import { createApp } from '../src/app.js';
import Course from '../src/models/Course.js';
import { startDb, stopDb, clearDb, sampleCourse } from './helpers.js';

const app = createApp();
beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);
afterEach(() => jest.restoreAllMocks());

test('GET /api/health returns ok', async () => {
  const res = await request(app).get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
});

test('lists an empty catalog', async () => {
  const res = await request(app).get('/api/courses');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ data: [], total: 0 });
});

test('lists courses newest first', async () => {
  await Course.create(sampleCourse({ title: 'Older one' }));
  await Course.create(sampleCourse({ title: 'Newer one' }));
  const res = await request(app).get('/api/courses');
  expect(res.body.data.map((c) => c.title)).toEqual(['Newer one', 'Older one']);
});

test('gets a course by id', async () => {
  const c = await Course.create(sampleCourse());
  const res = await request(app).get(`/api/courses/${c.id}`);
  expect(res.status).toBe(200);
  expect(res.body.data.title).toBe('HTML5 Basics');
});

test('400 for malformed id, 404 for unknown id', async () => {
  expect((await request(app).get('/api/courses/not-an-id')).status).toBe(400);
  expect((await request(app).get('/api/courses/507f1f77bcf86cd799439011')).status).toBe(404);
});

test('unknown route returns a JSON 404', async () => {
  const res = await request(app).get('/api/nope');
  expect(res.status).toBe(404);
  expect(res.body.error.message).toMatch(/not found/i);
});

test('500 does not leak internals', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(Course, 'find').mockImplementationOnce(() => { throw new Error('secret db detail'); });
  const res = await request(app).get('/api/courses');
  expect(res.status).toBe(500);
  expect(JSON.stringify(res.body)).not.toMatch(/secret/);
});
