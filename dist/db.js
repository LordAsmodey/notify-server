"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pgp = require('pg-promise')();
require('dotenv').config();
const connection = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};
const dataBase = pgp(connection);
exports.default = dataBase;