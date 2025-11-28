import { Router } from 'express';
import * as controller from '../controllers/teams.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { CreateTeamSchema } from '../utils/zod-schemas';


const router = Router();


router.post('/', validateBody(CreateTeamSchema), controller.create);
router.get('/:id', controller.getOne);


export default router;