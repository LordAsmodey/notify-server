import express from 'express';
import {CryptoController} from "../controllers/cryptoController.js";


const router = express.Router();

router.get('/getdata', CryptoController.getData);
router.get('/info', CryptoController.getServerInfo);

export default router;
