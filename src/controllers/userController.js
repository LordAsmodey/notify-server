import { UserModel } from '../models/userModel.js';
import TokenService from "../utils/TokenService.js";
import HashPasswordService from "../utils/HashPasswordService.js";
import { ServerErrorResponseEnum } from "../utils/ErrorResponses.js";
import {TokenModel} from "../models/tokenModel.js";

export const UserController = {
    registerUser: async (req, res) => {
        const { email, password, deviceId } = req.body;
        const { fingerprint } = req;
        try {
            const existingUser = await UserModel.findByEmail(email);

            if (existingUser) {
                return res.status(409).json({ message: ServerErrorResponseEnum.Conflict });
            }

            const hashedPassword = HashPasswordService.generateHash(password);
            // Register user
            const user = await UserModel.insertUser(email, hashedPassword, deviceId);

            const { accessToken, refreshToken } = await TokenService.generateTokens({ email });
            // Save RefreshSession token
            await TokenModel.insertRefreshSession(refreshToken, fingerprint, user[0].id);

            return res.json({ accessToken, refreshToken });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: ServerErrorResponseEnum.InternalServerError });
        }
    },

    authUser: async (req, res) => {
        const { email, password } = req.body;
        const { fingerprint } = req;
        try {
            const user = await UserModel.findByEmail(email);

            if (!user) {
                return res.status(404).json({ message: ServerErrorResponseEnum.NotFound });
            }

            const isPasswordValid = await HashPasswordService.comparePasswords(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: ServerErrorResponseEnum.Unauthorized });
            }
            const { accessToken, refreshToken } = await TokenService.generateTokens({ email });

            await TokenModel.insertRefreshSession(refreshToken, fingerprint, user.id);

            return res.json({ accessToken, refreshToken });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: ServerErrorResponseEnum.InternalServerError });
        }
    },

    getUserInfo: async (req, res) => {
        const { email } = req;
        try {
            const user = await UserModel.findByEmail(email);

            if (!user) {
                return res.status(404).json({ error: ServerErrorResponseEnum.NotFound });
            }
            delete user.password;

            return res.json(user);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: ServerErrorResponseEnum.InternalServerError });
        }
    },

    editFavoriteAssets: async (req, res) => {
        const { id, maxPrice, minPrice } = req.body;
        const { email } = req;

        try {
            const user = await UserModel.findByEmail(email);

            if (!user) {
                return res.status(404).json({ error: ServerErrorResponseEnum.NotFound });
            }

            const currentFavoriteAssets = user.favoriteAssets || [];
            const existingAssetIndex = currentFavoriteAssets.findIndex(asset => asset.id === id);

            if (existingAssetIndex !== -1) {
                currentFavoriteAssets[existingAssetIndex] = { id, maxPrice, minPrice };
            } else {
                currentFavoriteAssets.push({ id, maxPrice, minPrice });
            }

            await UserModel.updateUserFavoriteAssets(user.email, currentFavoriteAssets);
            res.status(200).json({ success: true, user: user });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: ServerErrorResponseEnum.InternalServerError });
        }
    },

    deleteFavoriteAsset: async (req, res) => {
        const { id } = req.body;
        const { email } = req;

        try {
            const user = await UserModel.findByEmail(email);

            if (!user) {
                return res.status(404).json({ error: ServerErrorResponseEnum.NotFound });
            }

            const currentFavoriteAssets = user.favoriteAssets || [];
            const existingAssetIndex = currentFavoriteAssets.findIndex(asset => asset.id === id);

            if (existingAssetIndex !== -1) {
                currentFavoriteAssets.splice(existingAssetIndex, 1);
                await UserModel.updateUserFavoriteAssets(user.email, currentFavoriteAssets);
                return res.status(200).json({ success: true, user: user });
            } else {
                return res.status(404).json({ error: ServerErrorResponseEnum.NotFound });
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: ServerErrorResponseEnum.InternalServerError });
        }
    },
};
