import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  },
  { timestamps: true }
);

// One ACTIVE enrollment per (email, course); a cancelled one doesn't block re-enrolling.
enrollmentSchema.index(
  { email: 1, course: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

export default mongoose.model('Enrollment', enrollmentSchema);
