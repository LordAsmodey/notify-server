import express from 'express';
import {UserController} from "../controllers/userController.js";
import {VerifyTokenMiddleware} from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

router.post('/register', UserController.registerUser);
router.post('/auth', UserController.authUser);
router.get('/getUserInfo',VerifyTokenMiddleware, UserController.getUserInfo);
router.put('/editFavoriteAssets',VerifyTokenMiddleware,  UserController.editFavoriteAssets);
router.delete('/deleteFavoriteAsset',VerifyTokenMiddleware, UserController.deleteFavoriteAsset);

export default router;
