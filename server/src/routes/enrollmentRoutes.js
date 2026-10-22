import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { createEnrollmentSchema, listEnrollmentsQuery, cancelBody } from '../validators/enrollmentSchemas.js';
import { createEnrollment, listEnrollments, cancelEnrollment } from '../controllers/enrollmentController.js';

const router = Router();
router.post('/', validate(createEnrollmentSchema), createEnrollment);
router.get('/', validate(listEnrollmentsQuery, 'query'), listEnrollments);
router.patch('/:id/cancel', validate(idParams, 'params'), validate(cancelBody), cancelEnrollment);
export default router;
