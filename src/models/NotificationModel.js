import { db } from '../db.js';
export const NotificationModel = {
  insertNotification: async (userId, currency, priceMin, priceMax) => {
    return db.one('INSERT INTO notifications (user_id, currency, price_min, price_max) VALUES ($1, $2, $3, $4) RETURNING *', [userId, currency, priceMin, priceMax]);
  },

  getUserNotifications: async (userId) => {
    return db.query('SELECT * FROM notifications WHERE user_id = $1', userId);
  },

  deleteNotification: async (id, userId) => {
    return db.oneOrNone('DELETE FROM notifications WHERE user_id = $1 AND id = $2 RETURNING *', [userId, id]);
  },

  updateNotificationById: async (id, userId, priceMin, priceMax) => {
    return db.one(
      'UPDATE notifications SET price_min = $1, price_max = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
      [priceMin, priceMax, id, userId]
    );
  },
};

