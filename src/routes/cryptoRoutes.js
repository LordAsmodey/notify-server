import express from 'express';
import {CryptoController} from "../controllers/cryptoController.js";
import {VerifyTokenMiddleware} from "../middlewares/verifyToken.middleware.js";


const router = express.Router();

router.get('/getdata',VerifyTokenMiddleware, CryptoController.getData);
router.get('/info', CryptoController.getServerInfo);

export default router;
