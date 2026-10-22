import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { HttpError } from '../middleware/errors.js';
import { wrap } from '../utils/wrap.js';

export const createEnrollment = wrap(async (req, res) => {
  const { fullName, email, courseId } = req.body;
  if (!(await Course.exists({ _id: courseId }))) throw new HttpError(404, 'Course not found');

  // 1) The unique partial index rejects duplicates atomically.
  let enrollment;
  try {
    enrollment = await Enrollment.create({ fullName, email, course: courseId });
  } catch (err) {
    if (err.code === 11000) throw new HttpError(409, 'Already enrolled in this course');
    throw err;
  }

  // 2) Atomic seat claim: the filter and $inc happen in one operation, so no oversell.
  const claimed = await Course.findOneAndUpdate(
    { _id: courseId, $expr: { lt:['enrolledCount', '$capacity'] } },
    { $inc: { enrolledCount: 1 } },
    { new: true }
  );
  if (!claimed) {
    await Enrollment.deleteOne({ _id: enrollment._id }); // compensate, no orphan row
    throw new HttpError(409, 'Course is full');
  }
  res.status(201).json({ data: enrollment });
});

export const listEnrollments = wrap(async (req, res) => {
  const data = await Enrollment.find({ email: req.query.email })
    .populate('course', 'title category durationHours')
    .sort({ createdAt: -1, _id: -1 })
    .lean();
  res.json({ data, total: data.length });
});

export const cancelEnrollment = wrap(async (req, res) => {
  const found = await Enrollment.findById(req.params.id);
  if (!found || found.email !== req.body.email) throw new HttpError(404, 'Enrollment not found');
  if (found.status === 'cancelled') return res.json({ data: found }); // idempotent

  const changed = await Enrollment.findOneAndUpdate(
    { _id: found._id, status: 'active' },
    { status: 'cancelled' },
    { new: true }
  );
  if (changed) await Course.updateOne({ _id: found.course, enrolledCount: { $gt: 0 } }, { $inc: { enrolledCount: -1 } });
  res.json({ data: changed || found });
});
