import mongoose from 'mongoose';
import Course from '../models/Course.js';
import { HttpError } from '../middleware/errors.js';
import { wrap } from '../utils/wrap.js';

export const listCourses = wrap(async (req, res) => {
  const data = await Course.find().sort({ createdAt: -1, _id: -1 }).lean();
  res.json({ data, total: data.length });
});

export const getCourse = wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(400, 'Invalid course id');
  const course = await Course.findById(req.params.id).lean();
  if (!course) throw new HttpError(404, 'Course not found');
  res.json({ data: course });
});
