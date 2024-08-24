import express, { Router } from "express";
import userController, {
  changeUserPassword,
  userLogin,
} from "../controllers/userController.js";
import checkUserAuth from "../middlewares/auth-middleware.js";

const userRouter = express.Router();

// Route Level Middleware - To protect Route
userRouter.use("/changepassword", checkUserAuth);

// Public Route
userRouter.post("/register", userController);
userRouter.post("/login", userLogin);

// Private Route (After login can Access)
userRouter.post("/changepassword", changeUserPassword);

export default userRouter;
