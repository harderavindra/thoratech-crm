import express from "express";

import { changePassword, login, me } from "./auth.controller";
import { logout } from "./auth.controller";
import { protect } from "../../middleware/auth.middleware";


const router =
  express.Router();

router.post(
  "/login",
  login
);

router.post(
  "/logout",
  protect,
  logout
);

router.get(
  "/me",
  protect,
  me
);

router.post(
  "/change-password",
  protect,
  changePassword
);

export default router;