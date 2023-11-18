import express from 'express';
import * as UserController from '../controllers/userController.js';

const router = express.Router();

router.post('/register', UserController.registerUser);
router.post('/auth', UserController.authUser);

export default router;
