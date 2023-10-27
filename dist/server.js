"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// @ts-ignore
const db_1 = __importDefault(require("/db")); // Создайте и настройте подключение к базе данных
app.use(express_1.default.json());
let cachedData = null;
function fetchDataFromAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield (0, node_fetch_1.default)(process.env.CRYPTO_PRICE_URL || '');
            if (response.ok) {
                cachedData = yield response.json(); // Кешируем полученные данные
                console.log(cachedData[0]);
            }
            else {
                console.error('Ошибка при получении данных:', response.status);
            }
        }
        catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    });
}
setInterval(fetchDataFromAPI, 70000);
app.get('/getdata', (req, res) => {
    if (cachedData) {
        res.json(cachedData);
    }
    else {
        res.status(404).json({ error: 'Данные еще не загружены' });
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
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, pass } = req.body;
    try {
        const existingUser = yield db_1.default.oneOrNone('SELECT * FROM users WHERE email = $1', email);
        if (existingUser) {
            return res.json({ message: 'User already exists' });
        }
        yield db_1.default.none('INSERT INTO users (email, pass) VALUES ($1, $2)', [email, pass]);
        res.json({ message: 'User registered' });
    }
    catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// Auth user
app.post('/auth', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, pass } = req.body;
    try {
        const user = yield db_1.default.oneOrNone('SELECT * FROM users WHERE email = $1', email);
        if (!user) {
            return res.json({ message: 'User not registered' });
        }
        if (user.pass === pass) {
            return res.json({ message: 'Authorized!' });
        }
        else {
            return res.json({ message: 'Authorization failed!' });
        }
    }
    catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
fetchDataFromAPI();
