import {NotificationModel} from "../models/NotificationModel.js";
import {ServerErrorResponseEnum} from "../utils/ErrorResponses.js";

export const NotificationController = {
  createNotification: async (req, res) => {
    const { userId, currency, priceMin, priceMax } = req.body;

    try {
      const userNotifications = await NotificationModel.getUserNotifications(userId);
      const isNotificationExist = userNotifications.some(notify => notify.currency === currency);

      if (isNotificationExist) {
        return res.status(409).json({ message: ServerErrorResponseEnum.NotificationAlreadyEnabled });
      }

      const newNotification = await NotificationModel.insertNotification(userId, currency, priceMin, priceMax);

      return res.json(newNotification);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: ServerErrorResponseEnum.InternalServerError });
    }
  },
  deleteNotification: async (req, res) => {
    const { userId, notificationId } = req.body;

    try {
      const deletedNotification = await NotificationModel.deleteNotification(notificationId, userId);

      if (!deletedNotification) {
        return res.status(404).json({ message: ServerErrorResponseEnum.NotFound });
      }

      return res.json({ success: true });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: ServerErrorResponseEnum.InternalServerError });
    }
  },
  getUserNotifications: async (req, res) => {
    const userId = req.userId;

    try {
      const notifications = await NotificationModel.getUserNotifications(userId);
      const result = notifications.map(notify => (
        {
          id: notify.id.toString(),
          createdAt: notify.created_at,
          updatedAt: notify.updated_at,
          userId: notify.user_id.toString(),
          priceMin: notify.price_min,
          priseMax: notify.price_max,
          currency: notify.currency
        }
      ));

      return res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: ServerErrorResponseEnum.InternalServerError });
    }
  },

  updateNotification: async (req, res) => {
    const { id, priceMin, priseMax } = req.body;
    const userId = req.userId;
    try {
      const updatedNotification = await NotificationModel.updateNotificationById(id, userId, priceMin, priseMax);
      const result = {
        id: updatedNotification.id.toString(),
        createdAt: updatedNotification.created_at,
        updatedAt: updatedNotification.updated_at,
        userId: updatedNotification.user_id.toString(),
        priceMin: updatedNotification.price_min,
        priseMax: updatedNotification.price_max,
        currency: updatedNotification.currency
      };

      return res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: ServerErrorResponseEnum.InternalServerError });
    }
  },
};
