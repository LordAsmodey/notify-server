const express = require('express');
const app = express();
const port = 3000;

const { db } = require('./db.ts'); // Создайте и настройте подключение к базе данных

app.use(express.json());

// Регистрация пользователя
app.post('/register', async (req, res) => {
    const { email, pass } = req.body;
    try {
        const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', email);

        if (existingUser) {
            return res.json({ message: 'User already exists' });
        }

        await db.none('INSERT INTO users (email, pass) VALUES ($1, $2)', [email, pass]);
        res.json({ message: 'User registered' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Аутентификация пользователя
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