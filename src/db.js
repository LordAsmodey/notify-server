import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

export const pgp = pgPromise();

const connection = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

export const db = pgp(connection);
