import { UserModel } from '../models/userModel.js';
import {db} from "../db.js";
import TokenService from "../utils/TokenService.js";

export const UserController = {
    registerUser: async (req, res) => {
        const { email, password, deviceId } = req.body;
        try {
            const existingUser = await UserModel.findByEmail(email);

            if (existingUser) {
                return res.json({ message: 'User already exists' });
            }

            await UserModel.insertUser(email, password, deviceId);
            res.json({ message: 'User registered' });
        } catch (error) {
            console.error('Error during registration:', error);
            res.status(500).json({ message: '500 Internal Server Error' });
        }
    },

    authUser: async (req, res) => {
        // Логика аутентификации пользователя
        const { email } = req.body;
        const { fingerprint } = req;
        const token = await TokenService.generateAccessToken({email, fingerprint});
        return res.json(token);
    },

    getUserInfo: async (req, res) => {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(403).json({ error: '403 forbidden' });
        }
        // Todo: add jwt-token service

        try {
            const user = await db.oneOrNone('SELECT * FROM users WHERE "accessToken" = $1', token);
            return res.json(user);
        } catch (err) {
            console.error(err);
            return res.status(403).json({ error: 'Invalid token' });
        }
    },

    editFavoriteAssets: async (req, res) => {
        try {
            const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
            const { id, maxPrice, minPrice } = req.body;
            const user = await UserModel.findByToken(token);

            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            const currentFavoriteAssets = user.favoriteAssets || [];
            const existingAssetIndex = currentFavoriteAssets.findIndex(asset => asset.id === id);

            if (existingAssetIndex !== -1) {
                currentFavoriteAssets[existingAssetIndex] = { id, maxPrice, minPrice };
            } else {
                currentFavoriteAssets.push({ id, maxPrice, minPrice });
            }

            await UserModel.updateUserFavoriteAssets(token, currentFavoriteAssets);
            res.status(200).json({ success: true, user: user });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: '500 Internal Server Error' });
        }
    },

    deleteFavoriteAsset: async (req, res) => {
        try {
            const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
            const { id } = req.body;
            const user = await UserModel.findByToken(token);

            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            const currentFavoriteAssets = user.favoriteAssets || [];
            const existingAssetIndex = currentFavoriteAssets.findIndex(asset => asset.id === id);

            if (existingAssetIndex !== -1) {
                currentFavoriteAssets.splice(existingAssetIndex, 1);
                await UserModel.updateUserFavoriteAssets(token, currentFavoriteAssets);
                res.status(200).json({ success: true, user: user });
            } else {
                res.status(404).json({ error: 'Ассет с указанным id не найден в списке избранных' });
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: '500 Internal Server Error' });
        }
    },

    // Добавьте другие методы управления пользователями при необходимости
};
