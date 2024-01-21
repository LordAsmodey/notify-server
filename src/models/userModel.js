import { db } from '../db.js';

export const UserModel = {
    findByEmail: async (email) => {
        return db.oneOrNone('SELECT * FROM users WHERE email = $1', email);
    },

    insertUser: async (email, password, deviceId) => {
        return db.query('INSERT INTO users (email, password, "deviceId", "favoriteAssets") VALUES ($1, $2, $3, $4) RETURNING *', [email, password, deviceId, []]);
    },

    updateUserFavoriteAssets: async (userEmail, favoriteAssets) => {
        return db.query('UPDATE users SET "favoriteAssets" = $1::json[] WHERE email = $2 RETURNING *', [
            favoriteAssets,
            userEmail,
        ]);
    },
};
