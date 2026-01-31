import { Router } from 'express';
import * as inventarioController from '../controllers/inventarioController';

const router = Router();

router.get('/', inventarioController.getInventario);

export default router;
