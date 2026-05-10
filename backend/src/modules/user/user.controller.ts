import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { User } from "./user.model";

import { AppError } from "../../utils/app-error";

export const createUser =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        username,
        fullName,
        email,
        phone,
        password,
        role,
      } = req.body;

      const existingUser =
        await User.findOne({
          $or: [
            { email },
            { username },
          ],
        });

      if (existingUser) {
        throw new AppError(
          "User already exists",
          400
        );
      }

      const user =
        await User.create({
          username,
          fullName,
          email,
          phone,
          password,
          role,
        });

      return res
        .status(201)
        .json({
          success: true,

          message:
            "User created successfully",

          data: {
            user: {
              id: user._id,
              username:
                user.username,
              fullName:
                user.fullName,
              email:
                user.email,
              role: user.role,
              status:
                user.status,
            },
          },
        });
    } catch (error) {
      next(error);
    }
  };