import * as UserModel from '../models/user.js';
// TODO: Add token service
export async function registerUser(req, res) {
    const { email, pass } = req.body;
    try {
        const existingUser = await UserModel.getUserByEmail(email);

        if (existingUser) {
            return res.json({ message: 'User already exists' });
        }

        await UserModel.registerUser(email, pass);
        res.json({ message: 'User registered' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function authUser(req, res) {
    const { email, pass } = req.body;
    try {
        const existingUser = await UserModel.getUserByEmail(email);
        if (!existingUser) {
            return res.json({ message: 'User not registered' });
        }
        if (user.pass === pass) {
            return res.json({ message: 'Authorized!' });
        } else {
            return res.json({ message: 'Authorization failed!' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
