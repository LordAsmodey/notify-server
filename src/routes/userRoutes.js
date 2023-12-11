import express from 'express';
import {UserController} from "../controllers/userController.js";

const router = express.Router();

router.post('/register', UserController.registerUser);
router.post('/auth', UserController.authUser);
router.get('/getUserInfo', UserController.getUserInfo);
router.put('/editFavoriteAssets', UserController.editFavoriteAssets);
router.delete('/deleteFavoriteAsset', UserController.deleteFavoriteAsset);

export default router;
