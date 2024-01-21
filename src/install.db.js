import pgPromise from "pg-promise";
import dotenv from 'dotenv';

const pgp = pgPromise();
dotenv.config();

// Замените параметрами подключения вашей базы данных
const db = pgp(`postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

async function createUsersTable() {
    try {
        const createTable = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                deviceId VARCHAR(255),
                favoriteAssets JSON[],
                notificationTime INTEGER,
            );
        `;
        await db.none(createTable);
        console.log('Таблица "users" успешно создана.');
    } catch (error) {
        console.error('Ошибка при создании таблицы "users":', error);
    } finally {
        pgp.end(); // Закрываем соединение с базой данных
    }
}

createUsersTable();


// refresh_sessions table:

// CREATE TABLE refresh_sessions(
//   id SERIAL PRIMARY KEY,
//   "userId" INT NOT NULL REFERENCES users("userId") ON DELETE CASCADE,
//   refresh_token VARCHAR(400) NOT NULL,
//   finger_print VARCHAR(128) NOT NULL
// );
