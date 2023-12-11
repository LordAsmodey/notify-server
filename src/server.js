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
        res.status(500).json({ message: '500 Internal Server Error' });
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
        res.status(500).json({ message: '500 Internal Server Error' });
    }
});

app.get('/getUserInfo', async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: '403 forbidden' });
    }
    // Todo: add jwt-token service

    try {
        const user = await db.oneOrNone('SELECT * FROM users WHERE "accessToken" = $1', token);
        return res.json(user);
    } catch (err) {
        console.error(err);
        return res.status(403).json({ error: 'Invalid token' });
    }
});

app.put('/editFavoriteAssets', async (req, res) => {
    try {
        // Получение токена из заголовков запроса
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

        // Получение данных ассета из тела запроса
        const { id, maxPrice, minPrice } = req.body;

        // Поиск пользователя по токену в базе данных
        const user = await db.oneOrNone('SELECT * FROM users WHERE "accessToken" = $1', [token]);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Получение текущего массива favoriteAssets пользователя
        const currentFavoriteAssets = user.favoriteAssets || [];

        const existingAssetIndex = currentFavoriteAssets.findIndex(asset => asset.id === id);

        // Если ассет существует, обновляем его; иначе, добавляем новый ассет
        if (existingAssetIndex !== -1) {
            currentFavoriteAssets[existingAssetIndex] = { id, maxPrice, minPrice };
        } else {
            currentFavoriteAssets.push({ id, maxPrice, minPrice });
        }
        // Обновление данных пользователя в базе данных
        const updateQuery = await db.query('UPDATE users SET "favoriteAssets" = $1::json[] WHERE "accessToken" = $2 RETURNING *' , [
            currentFavoriteAssets, // Не нужно использовать JSON.stringify здесь
            token,
        ]);
        res.status(200).json({ success: true, user: updateQuery[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: '500 Internal Server Error' });
    }
});

app.delete('/deleteFavoriteAsset', async (req, res) => {
    try {
        // Получение токена из заголовков запроса
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

        // Получение id ассета из тела запроса
        const { id } = req.body;

        // Поиск пользователя по токену в базе данных
        const user = await db.oneOrNone('SELECT * FROM users WHERE "accessToken" = $1', [token]);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Получение текущего массива favoriteAssets пользователя
        const currentFavoriteAssets = user.favoriteAssets || [];

        // Поиск ассета с указанным id в массиве
        const existingAssetIndex = currentFavoriteAssets.findIndex(asset => asset.id === id);

        // Если ассет существует, удаляем его из массива
        if (existingAssetIndex !== -1) {
            currentFavoriteAssets.splice(existingAssetIndex, 1);

            // Обновление данных пользователя в базе данных
           const updatedUser = await db.query('UPDATE users SET "favoriteAssets" = $1::json[] WHERE "accessToken" = $2 RETURNING *', [
                currentFavoriteAssets,
                token,
            ]);

            res.status(200).json({ success: true, user: updatedUser });
        } else {
            res.status(404).json({ error: 'Ассет с указанным id не найден в списке избранных' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: '500 Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

setInterval(fetchDataFromAPI, 70000);
fetchDataFromAPI();
