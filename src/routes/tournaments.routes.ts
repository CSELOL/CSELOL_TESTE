import { Router } from 'express';
import * as controller from '../controllers/tournaments.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { CreateTournamentSchema } from '../utils/zod-schemas';


const router = Router();


router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', validateBody(CreateTournamentSchema), controller.create);


export default router;