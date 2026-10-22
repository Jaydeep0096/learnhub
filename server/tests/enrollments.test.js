import request from 'supertest';
import { createApp } from '../src/app.js';
import Course from '../src/models/Course.js';
import Enrollment from '../src/models/Enrollment.js';
import { startDb, stopDb, clearDb, sampleCourse } from './helpers.js';

const app = createApp();
beforeAll(async () => { await startDb(); await Enrollment.init(); }); // wait for the partial unique index
afterAll(stopDb);
beforeEach(clearDb);

const payload = (courseId, o = {}) => ({
  fullName: 'Asha Rao', email: 'asha@example.com', courseId: String(courseId), acceptTerms: true, ...o,
});
const enroll = (b) => request(app).post('/api/enrollments').send(b);

test('enrolls and increments seats', async () => {
  const c = await Course.create(sampleCourse());
  const res = await enroll(payload(c.id));
  expect(res.status).toBe(201);
  expect((await Course.findById(c.id)).enrolledCount).toBe(1);
});

test('normalizes email', async () => {
  const c = await Course.create(sampleCourse());
  const res = await enroll(payload(c.id, { email: '  ASHA@Example.COM ' }));
  expect(res.body.data.email).toBe('asha@example.com');
});

test.each([
  ['short name', { fullName: 'A' }],
  ['digits in name', { fullName: 'R2D2' }],
  ['bad email', { email: 'nope' }],
  ['terms not accepted', { acceptTerms: false }],
  ['terms as string', { acceptTerms: 'true' }],
  ['unknown field', { role: 'admin' }],
  ['bad course id', { courseId: 'xyz' }],
])('400 on %s', async (_n, o) => {
  const c = await Course.create(sampleCourse());
  const res = await enroll(payload(c.id, o));
  expect(res.status).toBe(400);
  expect(res.body.error.details.length).toBeGreaterThan(0);
});

test('400 on malformed JSON', async () => {
  const res = await request(app).post('/api/enrollments').set('Content-Type', 'application/json').send('{bad');
  expect(res.status).toBe(400);
  expect(res.body.error.message).toBe('Malformed JSON body');
});

test('404 for unknown course', async () => {
  expect((await enroll(payload('507f1f77bcf86cd799439011'))).status).toBe(404);
});

test('409 on duplicate', async () => {
  const c = await Course.create(sampleCourse());
  await enroll(payload(c.id));
  expect((await enroll(payload(c.id))).status).toBe(409);
});

test('409 when full and no orphan row', async () => {
  const c = await Course.create(sampleCourse({ capacity: 1, enrolledCount: 1 }));
  expect((await enroll(payload(c.id))).status).toBe(409);
  expect(await Enrollment.countDocuments()).toBe(0);
});

test('HIDDEN: 5 parallel requests for 2 seats never oversell', async () => {
  const c = await Course.create(sampleCourse({ capacity: 2 }));
  const results = await Promise.all(
    [1, 2, 3, 4, 5].map((i) => enroll(payload(c.id, { email: `u${i}@example.com` })))
  );
  expect(results.filter((r) => r.status === 201)).toHaveLength(2);
  expect(results.filter((r) => r.status === 409)).toHaveLength(3);
  expect((await Course.findById(c.id)).enrolledCount).toBe(2);
  expect(await Enrollment.countDocuments({ course: c.id })).toBe(2);
});

test('lists by email; 400 without email', async () => {
  const c = await Course.create(sampleCourse());
  await enroll(payload(c.id));
  const res = await request(app).get('/api/enrollments').query({ email: 'asha@example.com' });
  expect(res.body.total).toBe(1);
  expect(res.body.data[0].course.title).toBe('HTML5 Basics');
  expect((await request(app).get('/api/enrollments')).status).toBe(400);
});

test('cancel: wrong email 404, success frees a seat, repeat is idempotent, re-enroll works', async () => {
  const c = await Course.create(sampleCourse());
  const { body } = await enroll(payload(c.id));
  const url = `/api/enrollments/${body.data._id}/cancel`;

  expect((await request(app).patch(url).send({ email: 'other@example.com' })).status).toBe(404);
  expect((await request(app).patch(url).send({ email: 'asha@example.com' })).body.data.status).toBe('cancelled');
  expect((await request(app).patch(url).send({ email: 'asha@example.com' })).status).toBe(200);
  expect((await Course.findById(c.id)).enrolledCount).toBe(0); // decremented exactly once
  expect((await enroll(payload(c.id))).status).toBe(201);
});
