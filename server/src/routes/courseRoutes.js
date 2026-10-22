// import { Router } from 'express';
// import { listCourses, getCourse } from '../controllers/courseController.js';

// const router = Router();
// router.get('/', listCourses);
// router.get('/:id', getCourse);
// export default router;
import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { listCourses, getCourse } from '../controllers/courseController.js';

const router = Router();
router.get('/', listCourses);
router.get('/:id', validate(idParams, 'params'), getCourse);
export default router;
