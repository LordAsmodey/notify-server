import express from 'express';
import {CryptoModel} from "./models/cryptoModel.js";
import cryptoRoutes from "./routes/cryptoRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import Fingerprint from "express-fingerprint";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(Fingerprint({parameters: [Fingerprint.useragent, Fingerprint.acceptHeaders, Fingerprint.geoip]}));
app.use((req, res, next) => {
    console.log('User Fingerprint:', req.fingerprint);
    next();
});

app.use('/', userRoutes);
app.use('/', cryptoRoutes);

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});

setInterval(async () => {
    const cachedData = await CryptoModel.fetchDataFromAPI();
    if (cachedData) {
        await CryptoModel.updateUsers(cachedData);
    }
}, 70000);
