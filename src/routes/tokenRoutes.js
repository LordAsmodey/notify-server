import express from "express";
import {TokenController} from "../controllers/tokenController.js";

const router = express.Router();

router.post('/updateAccessToken', TokenController.updateAccessToken);

export default router;
