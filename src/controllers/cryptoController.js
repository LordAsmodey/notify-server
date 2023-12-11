import { CryptoModel } from '../models/cryptoModel.js';

export const CryptoController = {getData: async (req, res) => {
    const cachedData = CryptoModel.getCachedData();
    if (cachedData) {
      res.json(cachedData);
    } else {
      res.status(404).json({ error: 'No data available' });
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
