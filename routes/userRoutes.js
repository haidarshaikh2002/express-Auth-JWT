import express, { Router } from "express";
import userController, {
  changeUserPassword,
  loggedUser,
  sendUserPasswordResetEmail,
  userLogin,
  userPasswordReset,
} from "../controllers/userController.js";
import checkUserAuth from "../middlewares/auth-middleware.js";

const userRouter = express.Router();

// Route Level Middleware - To protect Route
userRouter.use("/changepassword", checkUserAuth);
userRouter.use('/loggeduser', checkUserAuth);

// Public Route
userRouter.post("/register", userController);
userRouter.post("/login", userLogin);
userRouter.post("/send-reset-password-email", sendUserPasswordResetEmail)
userRouter.post('/reset-password/:id/:token', userPasswordReset)

// Private Route (After login can Access)
userRouter.post("/changepassword", changeUserPassword);
userRouter.get('/loggeduser', loggedUser);

export default userRouter;
