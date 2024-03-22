import { ServerErrorResponseEnum } from "../utils/ErrorResponses.js";
import TokenService from "../services/TokenService.js";

export const VerifyTokenMiddleware = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(403).json({error: ServerErrorResponseEnum.Forbidden});
  }

  try {
    const tokenData = await TokenService.verifyAccessToken(token);
    req.email = tokenData.email;
    req.userId = tokenData.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: ServerErrorResponseEnum.TokenExpired });
  }
};
