import express from 'express';
import cryptoRoutes from "./routes/cryptoRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import Fingerprint from "express-fingerprint";
import tokenRoutes from "./routes/tokenRoutes.js";
import cryptoService from "./utils/cryptoService.js";
import dotenv from "dotenv";

dotenv.config();


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(Fingerprint({parameters: [Fingerprint.useragent, Fingerprint.acceptHeaders, Fingerprint.geoip]}));
app.use((req, res, next) => {
    next();
});

app.use('/', userRoutes);
app.use('/', cryptoRoutes);
app.use('/', tokenRoutes);

app.listen(port, () => {
    console.log(`Server was started on port ${port}`);
});

cryptoService.fetchDataAndUpdate();

setInterval(() => cryptoService.fetchDataAndUpdate(), process.env.CRYPTO_PRICE_UPDATE_TIMEOUT);
