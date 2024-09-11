import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload;

    if (!decode) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    req.body.user = decode.userId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export default isAuthenticated;
