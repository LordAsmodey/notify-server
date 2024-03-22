import * as OneSignal from 'onesignal-node';
import dotenv from "dotenv";

dotenv.config();

const client = new OneSignal.Client(process.env.ONE_SIGNAL_APP_ID, process.env.ONE_SIGNAL_API_KEY);

const defaultNotification = {
    contents: {
        'en': 'Default Notification',
    },
    include_aliases: { "external_id": ["716a64718c04ec04"]},
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

