import mongoose from 'mongoose';
import { CATEGORIES, LEVELS } from '../constants.js';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    category: { type: String, required: true, lowercase: true, enum: CATEGORIES },
    level: { type: String, enum: LEVELS, default: 'beginner' },
    durationHours: { type: Number, required: true, min: 1, max: 200 },
    capacity: { type: Number, required: true, min: 1, max: 500 },
    enrolledCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);
