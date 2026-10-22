import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Course from './models/Course.js';

const courses = [
  { title: 'How the Web Works: HTTP & HTTPS', description: 'DNS, TCP, TLS, requests, responses, status codes and headers.', category: 'http', level: 'beginner', durationHours: 4, capacity: 30 },
  { title: 'HTML5 Semantics & Forms', description: 'Semantic tags, accessible forms, tables and built-in validation.', category: 'html', level: 'beginner', durationHours: 6, capacity: 25 },
  { title: 'CSS Box Model & Selectors', description: 'Specificity, the cascade, the box model and layout basics.', category: 'css', level: 'beginner', durationHours: 5, capacity: 25 },
  { title: 'Flexbox & Grid Layouts', description: 'Build responsive layouts without any framework.', category: 'css', level: 'intermediate', durationHours: 7, capacity: 20 },
  { title: 'JavaScript DOM & Events', description: 'Selecting, mutating and listening: bubbling and event delegation.', category: 'javascript', level: 'intermediate', durationHours: 8, capacity: 20 },
  { title: 'Git & GitHub Workflow', description: 'Branches, pull requests, merge conflicts and code review.', category: 'git', level: 'beginner', durationHours: 3, capacity: 2 },
];

await connectDB(process.env.MONGO_URI);
await Course.deleteMany({});
await Course.insertMany(courses);
console.log(`Seeded ${courses.length} courses`);
await mongoose.disconnect();
