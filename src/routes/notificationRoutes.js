import express from 'express';
import {NotificationController} from "../controllers/notificationController.js";
import {VerifyTokenMiddleware} from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

router.post('/createNotification', VerifyTokenMiddleware, NotificationController.createNotification);
router.delete('/deleteNotification', VerifyTokenMiddleware, NotificationController.deleteNotification);
router.get('/getUserNotifications', VerifyTokenMiddleware, NotificationController.getUserNotifications);
router.patch('/updateNotification', VerifyTokenMiddleware, NotificationController.updateNotification);
export default router;
