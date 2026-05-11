import type { Response, NextFunction } from "express";

import { z } from "zod";

import { User } from "./user.model";

import type { AuthRequest } from "../../middleware/auth.middleware";

import { escapeRegex } from "../../utils/escape-regex";

// Single source of truth for role-based creation/management permissions.
// canCreate: roles this actor may assign when creating or re-assigning.
// canManage: roles this actor may edit or delete.
const ROLE_PERMISSIONS: Record<string, { canCreate: string[]; canManage: string[] }> = {
  SUPER_ADMIN: {
    canCreate: ["SUPER_ADMIN", "ADMIN", "TEAM_LEAD", "AGENT", "QA"],
    canManage: ["SUPER_ADMIN", "ADMIN", "TEAM_LEAD", "AGENT", "QA"],
  },
  ADMIN: {
    canCreate: ["TEAM_LEAD", "AGENT", "QA"],
    canManage: ["TEAM_LEAD", "AGENT", "QA"],
  },
  TEAM_LEAD: {
    canCreate: ["AGENT", "QA"],
    canManage: ["AGENT", "QA"],
  },
};

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
                phone: 1,

                role: 1,

                status: 1,

                createdBy: 1,

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

    const actorRole = req.user!.role;
    const allowed = ROLE_PERMISSIONS[actorRole]?.canCreate ?? [];
    if (!allowed.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `You are not permitted to create a user with role ${role}`,
      });
    }

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

      createdBy: req.user!.id,
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

    const actorRole = req.user!.role;
    const actorId   = req.user!.id;
    const perms     = ROLE_PERMISSIONS[actorRole];

    const targetUser = await User.findById(req.params.id).select("role createdBy");
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent deactivating super admin
    if (targetUser.role === "SUPER_ADMIN" && parsed.data.status === "inactive") {
      return res.status(403).json({ success: false, message: "Super admin cannot be deactivated" });
    }

    // Actor must be able to manage the target's current role
    if (!perms?.canManage.includes(targetUser.role)) {
      return res.status(403).json({ success: false, message: "You are not permitted to manage this user" });
    }

    // TEAM_LEAD: restricted to own-created users and status-only changes
    if (actorRole === "TEAM_LEAD") {
      if (String(targetUser.createdBy) !== actorId) {
        return res.status(403).json({ success: false, message: "You can only manage users you created" });
      }
      const nonStatusKeys = Object.keys(parsed.data).filter((k) => k !== "status");
      if (nonStatusKeys.length > 0) {
        return res.status(403).json({ success: false, message: "Team leads can only change user status" });
      }
    }

    // Role assignment: new role must be within actor's creation scope
    if (parsed.data.role !== undefined && !perms?.canCreate.includes(parsed.data.role)) {
      return res.status(403).json({
        success: false,
        message: `You are not permitted to assign role ${parsed.data.role}`,
      });
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

export const getUserById =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user =
        await User.findById(
          req.params.id
        ).select(
          `
          fullName
          username
          email
          phone
          role
          status
          createdBy
          dateOfJoining
          createdAt
          updatedAt
          lastLogin
          passwordChangedAt
          loginAttempts
          lockoutUntil
        `
        );

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "User not found",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          data: {
            user,
          },
        });
    } catch (error) {
      next(error);
    }
  };

  export const deleteUser =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (user.role === "SUPER_ADMIN") {
        return res.status(403).json({ success: false, message: "Super admin cannot be deleted" });
      }

      await user.deleteOne();

      return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  };