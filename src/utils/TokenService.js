import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

class TokenService {
  static async generateAccessToken(payload) {
    return await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_EXP_TIME,
    });
  }

  static async generateRefreshToken(payload) {
    return await jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: process.env.REFRESH_TOKEN_EXP_TIME,
    });
  }

  static async verifyAccessToken(accessToken) {
    try {
      return await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        console.log('AccessToken expired');
      } else {
        console.error(e);
      }
      return null;
    }
  }

  static async verifyRefreshToken(refreshToken) {
    try {
      return await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        console.log('RefreshToken expired');
      } else {
        console.error(e);
      }
      return null;
    }
  }

  static async checkAccess(req, _, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")?.[1];

    if (!token) {
      return next(new Unauthorized());
    }

    try {
      req.user = await TokenService.verifyAccessToken(token);
      console.log(req.user);
    } catch (error) {
      console.log(error);
      return next(new Forbidden(error));
    }

    next();
  }
}

export default TokenService;
