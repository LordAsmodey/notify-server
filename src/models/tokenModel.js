import { db } from '../db.js';

export const TokenModel = {
  insertRefreshSession: async (refreshToken, fingerprint, userId) => {

    const existingSession = await db.oneOrNone('SELECT * FROM refresh_sessions WHERE finger_print = $1 AND "userId" = $2', [fingerprint, userId]);

    if (existingSession) {
      return db.none('UPDATE refresh_sessions SET refresh_token = $1 WHERE finger_print = $2 AND "userId" = $3',
        [refreshToken, fingerprint, userId]);
    } else {
      return db.none('INSERT INTO refresh_sessions (refresh_token, finger_print, "userId") VALUES ($1, $2, $3)',
        [refreshToken, fingerprint, userId]);
    }

  },

  getRefreshSessionByToken: async (refreshToken) => {
    return db.oneOrNone('SELECT * FROM refresh_sessions WHERE refresh_token = $1', refreshToken);
  },

  deleteRefreshSessionsByUserId: async (userId, fingerprint) => {
    if (fingerprint) {
      return db.query(`DELETE FROM refresh_sessions WHERE "userId" = $1 AND finger_print = $2`,
        [userId, fingerprint]);
    }
    return db.query(`DELETE FROM refresh_sessions WHERE "userId" = $1`, userId);
  }
}
