import fetchData from 'node-fetch';
import { db, pgp } from '../db.js';

let cachedData = null;

export const CryptoModel = {
  fetchDataFromAPI: async () => {
    try {
      const response = await fetchData(process.env.CRYPTO_PRICE_URL || '');
      if (response.ok) {
        cachedData = await response.json(); // Обновляем кеш
      } else {
        console.error('ERROR:', response.status);
      }
    } catch (error) {
      console.error('REQUEST ERROR:', error);
    }
  },

  getCachedData: () => {
    return cachedData;
  },

  // Notify sending logic
  updateUsers: async (cachedData) => {
    try {
      const updateParams = [];
      const notifications = [];
      const users = await db.any('SELECT * FROM users');

      for (const user of users) {
        if (!user.favoriteAssets) {
          continue; // Пропустить пользователя без избранных ассетов
        }

        for (const asset of user.favoriteAssets) {
          const crypto = cachedData.find((c) => c.id === asset.id);
          const userAlreadyExist = updateParams.some(item => item.userId === user.userId);

          if (crypto) {
            if ((crypto.current_price < asset.minPrice || crypto.current_price > asset.maxPrice) && !userAlreadyExist) {
              updateParams.push({ notificationTime: user.userId * 3, userId: user.userId });
              const message = `${crypto.id} - ${crypto.current_price} $`;
              notifications.push({
                contents: {
                  'en': message,
                },
                include_aliases: { "deviceId": [user.deviceId]},
                "target_channel": "push",
              });
            }
          }
        }
      }

      if (updateParams.length > 0) {
        const updateQueries = updateParams.map(param => {
          return pgp.helpers.update(
            param,
            ['notificationTime'],
            'users'
          ) + ` WHERE "userId" = ${param.userId}`;
        });

        const combinedQuery = updateQueries.join('; ');

        await db.none(combinedQuery);

        // Отправка уведомлений
        // notifications.forEach(notify => sendMsg(notify));
      }
    } catch (error) {
      console.error('Error during updateUsers:', error);
    }
  },
};
