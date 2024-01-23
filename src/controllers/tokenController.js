import {ServerErrorResponseEnum} from "../utils/ErrorResponses.js";
import {TokenModel} from "../models/tokenModel.js";
import TokenService from "../utils/TokenService.js";

export const TokenController = {
  updateAccessToken: async (req, res) => {
    const { refreshToken } = req.body;
    const { fingerprint } = req;

    try {
      const tokenData = await TokenService.verifyRefreshToken(refreshToken);
      if (!tokenData) {
        return res.status(403).json({ error: ServerErrorResponseEnum.Forbidden });
      }

      const { finger_print, userId, refresh_token } = await TokenModel.getRefreshSessionByToken(refreshToken);

      if (!refresh_token) {
        return res.status(404).json({ message: ServerErrorResponseEnum.NotFound });
      }

      const isSessionsMatch = JSON.parse(finger_print).hash === fingerprint.hash;

      if (!isSessionsMatch) {
        await TokenModel.deleteRefreshSessionsByUserId(userId);
        return res.status(403).json({ error: ServerErrorResponseEnum.Forbidden });
      }

      const newAccessToken = await TokenService.generateAccessToken({ email: tokenData.email });
      const newRefreshToken = await TokenService.generateRefreshToken({ email: tokenData.email });

      await TokenModel.insertRefreshSession(newRefreshToken, fingerprint, userId);

      return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: ServerErrorResponseEnum.InternalServerError });
    }
  },
};
