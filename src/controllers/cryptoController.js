import { CryptoModel } from '../models/cryptoModel.js';
import { ServerErrorResponseEnum } from "../utils/ErrorResponses.js";
import TokenService from "../utils/TokenService.js";

export const CryptoController = {
  getData: async (req, res) => {
    const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
    const tokenData = await TokenService.verifyAccessToken(accessToken);
    const cachedData = CryptoModel.getCachedData();

    if (!tokenData) {
      return res.status(401).json({ error: ServerErrorResponseEnum.TokenExpired });
    }

    if (cachedData) {
      res.json(cachedData);
    } else {
      res.status(404).json({ error: ServerErrorResponseEnum.NotFound });
    }
  },

  getServerInfo: async (req, res) => {
    const serverInfo = {
      message: 'Server is working',
      serverTime: new Date().toTimeString(),
      version: '1.0.0',
    };

    res.json(serverInfo);
  },
};
