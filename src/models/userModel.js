import { db } from '../db.js';

export const UserModel = {
    findByEmail: async (email) => {
        return db.oneOrNone('SELECT * FROM users WHERE email = $1', email);
    },

    insertUser: async (email, password, deviceId) => {
        return db.none('INSERT INTO users (email, password, "deviceId", "favoriteAssets") VALUES ($1, $2, $3, $4)', [email, password, deviceId, []]);
    },

    findByToken: async (token) => {
        return db.oneOrNone('SELECT * FROM users WHERE "accessToken" = $1', token);
    },

    updateUserFavoriteAssets: async (token, favoriteAssets) => {
        return db.query('UPDATE users SET "favoriteAssets" = $1::json[] WHERE "accessToken" = $2 RETURNING *', [
            favoriteAssets,
            token,
        ]);
    },

};
