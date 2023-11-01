import { db } from '../db.js';

export async function getUserByEmail(email) {
    return db.oneOrNone('SELECT * FROM users WHERE email = $1', email);
}

export async function registerUser(email, pass) {
    return db.none('INSERT INTO users (email, pass) VALUES ($1, $2)', [email, pass]);
}
