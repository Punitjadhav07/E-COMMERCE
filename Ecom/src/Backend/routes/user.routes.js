// backend/routes/user.routes.js
import express from "express";
import {
  getMe,
  getAllUsers,
  updateUserStatus,
  deleteUser,
} from "../controllers/user.controller.js";
import db from "../config/database.js";

const router = express.Router();

// attach db
router.use((req, res, next) => {
  req.db = db;
  next();
});

router.get("/me", getMe);
router.get("/", getAllUsers);
router.patch("/:id/status", updateUserStatus);
router.delete("/:id", deleteUser);

export default router;
