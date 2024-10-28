import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/register", userController.registerOne);
router.post("/login", userController.loginOne);
router.get("/protected", auth, (req, res) => {
  res.send("This is a protected route");
});

export default router;
