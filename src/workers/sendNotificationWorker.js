import { parentPort, workerData } from 'worker_threads';
import {NotificationModel} from "../models/NotificationModel.js";
import {sendMsg} from "../openSignal.js";

async function sendNotifyFunc () {
  const currentNotifications = await NotificationModel.getAllNotifications();
  const cryptoCurrencyAssets = workerData.cryptoCurrencyAssets;
  const notificationsByCurrency = {};

  currentNotifications.forEach((notification) => {
    const foundedAsset = cryptoCurrencyAssets?.find(asset => asset.name === notification.currency);
    if (foundedAsset && (notification.price_min >= foundedAsset.current_price || notification.price_max <= foundedAsset.current_price)) {
      if (!notificationsByCurrency[notification.currency]) {
        notificationsByCurrency[notification.currency] = {
          currency: notification.currency,
          price: foundedAsset.current_price,
          externalIds: [],
        };
      }
      notificationsByCurrency[notification.currency].externalIds.push(notification.deviceId);
    }
  });

  for (const currencyKey in notificationsByCurrency) {
    if (Object.prototype.hasOwnProperty.call(notificationsByCurrency, currencyKey)) {
      const { currency, price, externalIds } = notificationsByCurrency[currencyKey];

      const notify = {
        contents: {
          'en': `${currency} - ${price} $`,
        },
        include_aliases: { "external_id": externalIds },
        "target_channel": "push",
      };

      await sendMsg(notify);
    }
  }

  await NotificationModel.moveNotificationsToSentTable(currentNotifications.map(notification => notification.id));
}

try {
  await sendNotifyFunc();
  parentPort.postMessage({ done: true });
} catch (error) {
  console.error(error);
  parentPort.postMessage({ error: error.message });
}

