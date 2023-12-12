import jwt from "jsonwebtoken";

class TokenService {
  static async generateAccessToken(payload) {
    return await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: "30m",
    });
  }

  static async generateRefreshToken(payload) {
    return await jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: "15d",
    });
  }

  static async verifyAccessToken(accessToken) {
    return await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
  }

  static async verifyRefreshToken(refreshToken) {
    return await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
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
