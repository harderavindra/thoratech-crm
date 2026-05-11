import type { Response, NextFunction } from "express";

import { z } from "zod";

import { User } from "./user.model";

import type { AuthRequest } from "../../middleware/auth.middleware";

import { escapeRegex } from "../../utils/escape-regex";

const usersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().max(100).optional(),

  role: z.string().trim().optional(),

  status: z.string().trim().optional(),
});

export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = usersQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,

        message: "Invalid query params",

        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { page, limit, search, role, status } = parsed.data;

    const skip = (page - 1) * limit;

    const match: Record<string, unknown> = {};

    if (role) {
      match.role = role;
    }

    if (status) {
      match.status = status;
    }

    if (search) {
      const safeSearch = escapeRegex(search);

      match.$or = [
        {
          fullName: {
            $regex: safeSearch,

            $options: "i",
          },
        },

        {
          email: {
            $regex: safeSearch,

            $options: "i",
          },
        },
      ];
    }

    const [result] = await User.aggregate([
      {
        $match: match,
      },

      {
        $facet: {
          metadata: [
            {
              $count: "total",
            },
          ],

          data: [
            {
              $sort: {
                createdAt: -1,
              },
            },

            {
              $skip: skip,
            },

            {
              $limit: limit,
            },

            {
              $project: {
                fullName: 1,

                email: 1,

                role: 1,

                status: 1,

                createdAt: 1,
              },
            },
          ],
        },
      },
    ]);

    const total = result?.metadata?.[0]?.total ?? 0;

    const users = result?.data ?? [];

    const totalPages = Math.ceil(total / limit);

    res.set("Cache-Control", "private, max-age=30");

    res.set("X-Total-Count", String(total));

    return res.status(200).json({
      success: true,

      data: {
        users,

        pagination: {
          total,

          page,

          limit,

          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const createUserSchema = z.object({
      fullName: z.string().trim().min(2).max(100),

      email: z.string().trim().email(),

      phone: z.string().trim().min(5).max(20),

      password: z.string().min(8).max(100),

      role: z.enum(["SUPER_ADMIN", "ADMIN", "TEAM_LEAD", "AGENT", "QA"]),

      status: z.enum(["active", "inactive"]).optional(),
    });

    const parsed = createUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,

        message: "Validation failed",

        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { fullName, email, phone, password, role, status } = parsed.data;

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,

        message: "User already exists",
      });
    }

    const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const existing = await User.findOne({ username: baseUsername });
    const username = existing ? `${baseUsername}${Date.now().toString().slice(-4)}` : baseUsername;

    const user = await User.create({
      fullName,

      email: email.toLowerCase(),

      phone,

      username,

      password,

      role,

      status: status || "active",
    });

    return res.status(201).json({
      success: true,

      message: "User created successfully",

      data: {
        user: {
          id: user._id,

          fullName: user.fullName,

          email: user.email,

          phone: user.phone,

          role: user.role,

          status: user.status,

          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updateUserSchema = z.object({
      fullName: z.string().trim().min(2).max(100).optional(),

      email: z.string().trim().email().optional(),

      phone: z.string().trim().min(5).max(20).optional(),

      role: z.enum(["SUPER_ADMIN", "ADMIN", "TEAM_LEAD", "AGENT", "QA"]).optional(),

      status: z.enum(["active", "inactive"]).optional(),
    });

    const parsed = updateUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,

        message: "Validation failed",

        errors: parsed.error.flatten().fieldErrors,
      });
    }

    if (parsed.data.email) {
      const conflict = await User.findOne({
        email: parsed.data.email.toLowerCase(),
        _id: { $ne: req.params.id },
      });

      if (conflict) {
        return res.status(409).json({ success: false, message: "Email already in use" });
      }

      parsed.data.email = parsed.data.email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: parsed.data },
      { new: true, runValidators: true },
    ).select("fullName email phone role status createdAt");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,

      message: "User updated successfully",

      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
