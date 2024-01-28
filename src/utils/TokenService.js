import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

class TokenService {

  static async generateTokens(payload) {
    const accessToken = await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_EXP_TIME,
    });
    const refreshToken = await jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: process.env.REFRESH_TOKEN_EXP_TIME,
    });

    return { accessToken, refreshToken };
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
}

export default TokenService;
