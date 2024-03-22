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

  getAllNotifications: async () => {
    return db.query('SELECT notifications.*, users."deviceId" FROM notifications JOIN users ON notifications.user_id = users.id');
  },

  moveNotificationsToSentTable: async (notificationsIds) => {
    try {
      await db.query('BEGIN');

      await db.query(`
      INSERT INTO sent_notifications (notification_id, user_id, currency, price_min, price_max, sent_at)
      SELECT id, user_id, currency, price_min, price_max, NOW()
      FROM notifications
      WHERE id = ANY($1)
    `, [notificationsIds]);

      await db.query(`
      DELETE FROM notifications
      WHERE id = ANY($1)
    `, [notificationsIds]);

      await db.query('COMMIT');
    } catch (error) {
      console.error(error);
      await db.query('ROLLBACK');
    }
  },
};

