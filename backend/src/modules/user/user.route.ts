import express from "express";

import { createUser, getUsers, updateUser } from "./user.controller";

import { protect, authorize } from "../../middleware/auth.middleware";

const router = express.Router();

router.post("/", protect, authorize("SUPER_ADMIN", "ADMIN"), createUser);
router.get("/", protect, authorize("SUPER_ADMIN", "ADMIN"), getUsers);
router.put("/:id", protect, authorize("SUPER_ADMIN", "ADMIN"), updateUser);

export default router;
