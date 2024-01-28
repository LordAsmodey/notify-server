import express from 'express';
import {NotificationController} from "../controllers/notificationController.js";

const router = express.Router();

router.post('/createNotification', NotificationController.createNotification);
export default router;
