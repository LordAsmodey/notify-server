import {CryptoModel} from "../models/cryptoModel.js";
import {Worker} from "worker_threads";

export function runSendNotificationWorker() {
  return new Promise((resolve, reject) => {
    const cachedData = CryptoModel.getCachedData();
    const worker = new Worker('./src/workers/sendNotificationWorker.js', {
      workerData: {cryptoCurrencyAssets: cachedData}
    });

    worker.on('message', (message) => {
      if (message && message.done) {
        resolve();
      }
    });

    worker.on('error', (error) => {
      console.error(error);
      reject(error);
    });
  });
}
