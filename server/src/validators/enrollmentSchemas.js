import { z } from 'zod';
import { objectId } from './common.js';

const email = z.string().trim().toLowerCase().email().max(254);

export const createEnrollmentSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80).regex(/^[\p{L} .'-]+$/u, 'Only letters, spaces and . - allowed'),
    email,
    courseId: objectId,
    acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
  })
  .strict();

export const listEnrollmentsQuery = z.object({ email });
export const cancelBody = z.object({ email }).strict();
