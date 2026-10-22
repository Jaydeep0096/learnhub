import { Router } from 'express';
import { listCourses, getCourse } from '../controllers/courseController.js';

const router = Router();
router.get('/', listCourses);
router.get('/:id', getCourse);
export default router;
