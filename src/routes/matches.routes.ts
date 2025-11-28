import { Router } from 'express';
import * as controller from '../controllers/matches.controller';


const router = Router();


router.post('/', controller.create);
router.put('/:id/score', controller.updateScore);


export default router;