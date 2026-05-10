import express from "express";

import { createUser } from "./user.controller";

import {
  protect,
  authorize,
} from "../../middleware/auth.middleware";

const router =
  express.Router();

router.post(
  "/",
  protect,
  authorize(
    "SUPER_ADMIN",
    "ADMIN"
  ),
  createUser
);

export default router;