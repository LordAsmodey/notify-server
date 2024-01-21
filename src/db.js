import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

export const pgp = pgPromise();

const connection = {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
};

export const db = pgp(connection);
