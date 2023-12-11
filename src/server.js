import express from 'express';
import {CryptoModel} from "./models/cryptoModel.js";
import cryptoRoutes from "./routes/cryptoRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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
