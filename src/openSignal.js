import * as OneSignal from 'onesignal-node';

// Создание экземпляра OneSignal с использованием вашего APP_ID и REST API ключа
const client = new OneSignal.Client('454552f5-e593-450f-8814-f12e7c26ead2', 'MTZmYWI3OWItYzNiNy00MzUyLTg4Y2ItMmQ1MjQzZGJiNmNh');

// Токен устройства, которому нужно отправить уведомление
// const deviceToken = 'e82b478e-c132-4971-b533-d2898a77809b';

const defaultNotification = {
    contents: {
        'en': 'Default Notification',
    },
    include_aliases: { "deviceId": ["716a64718c04ec04"]},
    "target_channel": "push",
};

export const sendMsg = async (notification = defaultNotification) => {
    try {
        const response = await client.createNotification(notification);
        console.log(response.body);
    } catch (e) {
        if (e instanceof OneSignal.HTTPError) {
            // When status code of HTTP response is not 2xx, HTTPError is thrown.
            console.log(e.statusCode);
            console.log(e.body);
        }
    }
};

