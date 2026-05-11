import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { z } from "zod";

import { User } from "../user/user.model";

import {
  LOCKOUT_DURATION_MS,
  MAX_ATTEMPTS,
  COOKIE_MAX_AGE_MS,
} from "../../constants/auth.constants";

import { signToken } from "../../utils/jwt";

import type { AuthRequest } from "../../middleware/auth.middleware";
import { PASSWORD_COMPLEXITY } from "../../constants/auth.constants";
const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "strict") as "none" | "strict",
  maxAge: COOKIE_MAX_AGE_MS,
};

const safeUser = (user: any) => ({
  id: user._id,
  username: user.username,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  status: user.status,
});

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password +loginAttempts +lockoutUntil");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive. Contact administrator.",
      });
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockoutUntil.getTime() - Date.now()) / 60000
      );

      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${minutesLeft} minute${
          minutesLeft !== 1 ? "s" : ""
        }.`,
        lockoutUntil: user.lockoutUntil,
      });
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= MAX_ATTEMPTS) {
        user.lockoutUntil = new Date(
          Date.now() + LOCKOUT_DURATION_MS
        );

        user.loginAttempts = 0;

        await user.save({
          validateBeforeSave: false,
        });

        return res.status(423).json({
          success: false,
          message:
            "Account locked after multiple failed attempts. Try again later.",
          lockoutUntil: user.lockoutUntil,
        });
      }

      await user.save({
        validateBeforeSave: false,
      });

      return res.status(401).json({
        success: false,
        message: `Invalid credentials. ${
          MAX_ATTEMPTS - user.loginAttempts
        } attempt${
          MAX_ATTEMPTS - user.loginAttempts !== 1 ? "s" : ""
        } remaining.`,
      });
    }

    user.loginAttempts = 0;
    user.lockoutUntil = null;
    user.lastLogin = new Date();

    await user.save({
      validateBeforeSave: false,
    });

    const token = signToken({
      id: user._id,
      role: user.role,
      username: user.username,
    });

    res.cookie("accessToken", token, cookieOptions);

    console.log({
      event: "LOGIN_SUCCESS",
      userId: user._id,
      username: user.username,
      timestamp: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: safeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};



export const logout = async (
  req: Request,
  res: Response
) => {
  res.clearCookie("accessToken", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

export const me = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(
      req.user?.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: safeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const updateMeSchema = z.object({
      fullName: z.string().trim().min(2).max(100).optional(),
      phone: z.string().trim().min(5).max(20).optional(),
    });

    const parsed = updateMeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).select("fullName email phone role status username");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user: safeUser(user) },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !PASSWORD_COMPLEXITY.test(
        newPassword
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 10 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    const user = await User.findById(
      req.user?.id
    ).select(
      "+password +passwordHistory"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatched =
      await user.comparePassword(
        currentPassword
      );

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    const isReused =
      await user.isPasswordReused(
        newPassword
      );

    if (isReused) {
      return res.status(400).json({
        success: false,
        message:
          "Password has been used recently. Choose a different password.",
      });
    }

    user.passwordHistory = [
      {
        hash: user.password,
        changedAt:
          user.passwordChangedAt ||
          new Date(),
      },

      ...user.passwordHistory,
    ].slice(0, 5);

    user.password = newPassword;

    user.passwordChangedAt =
      new Date();

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};