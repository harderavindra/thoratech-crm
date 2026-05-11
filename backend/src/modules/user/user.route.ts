import express from "express";

import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "./user.controller";

import { protect, authorize } from "../../middleware/auth.middleware";

const router = express.Router();

router.post("/",   protect, authorize("SUPER_ADMIN", "ADMIN", "TEAM_LEAD"), createUser);
router.get("/",    protect, authorize("SUPER_ADMIN", "ADMIN", "TEAM_LEAD"), getUsers);
router.patch("/:id", protect, authorize("SUPER_ADMIN", "ADMIN", "TEAM_LEAD"), updateUser);
router.get("/:id", protect, authorize("SUPER_ADMIN", "ADMIN", "TEAM_LEAD"), getUserById);
router.delete("/:id", protect, authorize("SUPER_ADMIN", "ADMIN"), deleteUser);
export default router;
