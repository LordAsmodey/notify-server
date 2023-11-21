import fetchData from 'node-fetch';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

import {db, pgp} from './db.js';
import {sendMsg} from "./openSignal.js";

app.use(express.json());

let cachedData = null;

async function updateUsers () {
    const updateParams = [];
    const notifications = [];
    const users = await db.any('SELECT * FROM users');

    for (const user of users) {
        for (const asset of user.favoriteAssets) {
            const crypto = cachedData.find((c) => c.id === asset.id);
            const userAlreadyExist = updateParams.some(item => item.userId === user.userId);

            if (crypto) {
                if ((crypto.current_price < asset.minPrice || crypto.current_price > asset.maxPrice) && !userAlreadyExist) {
                    // Add updating params
                    updateParams.push({ notificationTime: user.userId * 3, userId: user.userId });
                    // Notify sending
                    console.log(asset)
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
        // Todo: Optimize

        const updateQueries = updateParams.map(param => {
            return pgp.helpers.update(
                param,
                ['notificationTime'],
                'users'
            ) + ` WHERE "userId" = ${param.userId}`;
        });

        const combinedQuery = updateQueries.join('; ');

        await db.none(combinedQuery);
        //console.log('notifications:', notifications)
        //notifications.forEach(notify => sendMsg(notify));
    }
}
async function fetchDataFromAPI() {
    try {
        const response = await fetchData(process.env.CRYPTO_PRICE_URL || '');
        if (response.ok) {
            cachedData = await response.json(); // Crypto data
        } else {
            console.error('ERROR:', response.status);
        }
        await updateUsers();
    } catch (error) {
        console.error('REQUEST ERROR:', error);
    }
}

app.get('/getdata', (req, res) => {
    if (cachedData) {
        res.json(cachedData);
    } else {
        res.status(404).json({ error: 'No data from api' });
    }
});

app.get('/info', (req, res) => {
    const serverInfo = {
        message: 'Server is working',
        serverTime: new Date().toTimeString(),
        version: '1.0.0',
    };

    res.json(serverInfo);
});

// Register user
app.post('/register', async (req, res) => {
    const { email, password, deviceId } = req.body;
    try {
        const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', email);

        if (existingUser) {
            return res.json({ message: 'User already exists' });
        }

        await db.none('INSERT INTO users (email, password, "deviceId", "favoriteAssets") VALUES ($1, $2, $3, $4)', [email, password, deviceId, []]);
        res.json({ message: 'User registered' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Auth user
app.post('/auth', async (req, res) => {
    const { email, pass } = req.body;

    try {
        const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', email);

        if (!user) {
            return res.json({ message: 'User not registered' });
        }

        if (user.pass === pass) {
            return res.json({ message: 'Authorized!' });
        } else {
            return res.json({ message: 'Authorization failed!' });
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

setInterval(fetchDataFromAPI, 70000);
fetchDataFromAPI();
