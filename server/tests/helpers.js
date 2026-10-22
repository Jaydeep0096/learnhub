import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;
export async function startDb() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}
export async function stopDb() {
  await mongoose.disconnect();
  await mongod.stop();
}
export async function clearDb() {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
}
export const sampleCourse = (o = {}) => ({
  title: 'HTML5 Basics', description: 'Semantic markup.', category: 'html',
  level: 'beginner', durationHours: 6, capacity: 2, ...o,
});
