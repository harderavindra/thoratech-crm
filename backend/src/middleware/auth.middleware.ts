import type {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt, {
  type JwtPayload,
} from "jsonwebtoken";

export interface AuthRequest 
  extends Request {
  user?: JwtPayload & {
    id: string;
    role: string;
    username: string;
  };
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("req.cookies", req.cookies);
    const token =
      req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const decoded =
      jwt.verify(
        token,
        process.env
          .JWT_SECRET as string
      ) as JwtPayload & {
        id: string;
        role: string;
        username: string;
      };

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
};

export const authorize =
  (...roles: string[]) =>
  (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      !roles.includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };