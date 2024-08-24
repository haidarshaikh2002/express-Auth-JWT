import userModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

let userController = async (req, res) => {
  const { name, email, password, password_confirmation, tc } = req.body;

  // Check for required fields
  if (!name || !password || !password_confirmation || !tc) {
    return res
      .status(400)
      .send({ status: "Failed", message: "All Fields are required" });
  }

  // Check if email already exists
  try {
    const user = await userModel.findOne({ email: email });

    if (user) {
      return res
        .status(400)
        .send({ status: "Failed", message: "Email already exists" });
    }

    // Check if passwords match
    if (password !== password_confirmation) {
      return res
        .status(400)
        .send({
          status: "Failed",
          message: "Password and Confirm password do not match",
        });
    }

    // Hash password and save user
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name,
      email: email,
      password: hashPassword,
      tc: tc,
    });

    await newUser.save();
    const saved_user = await userModel.findOne({ email: email });
    // /Generate JWT TOken
    const token = jwt.sign(
      { userID: saved_user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5d" }
    );

    return res
      .status(201)
      .send({
        status: "Success",
        message: "Registration successfull",
        token: token,
      });
  } catch (error) {
    console.error(error); // Log error for debugging
    return res
      .status(500)
      .send({ status: "Failed", message: "Unable to register" });
  }
};

export default userController;

export let userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user = await userModel.findOne({ email: email });
      if (user != null) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (user.email === email && isMatch) {
          const saved_user = await userModel.findOne({ email: email });
          // /Generate JWT TOken
          const token = jwt.sign(
            { userID: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "5d" }
          );

          res
            .status(201)
            .send({
              status: "Success",
              message: "Login successfully",
              token: token,
            });
        } else {
          res
            .status(400)
            .send({
              status: "Failed",
              message: "Password or Email Doesn't match",
            });
        }
      } else {
        res
          .status(400)
          .send({ status: "Failed", message: "You are not a registered user" });
      }
    } else {
      res
        .status(400)
        .send({ status: "Failed", message: "All Fields are required" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: "Failed", message: "unable to login" });
  }
};

// After Login User Can Access This page
export let changeUserPassword = async (req, res) => {
  const { password, password_confirmation } = req.body;
  if (password && password_confirmation) {
    if (password !== password_confirmation) {
      res
        .status(400)
        .send({
          status: "Failed",
          message: "New password and Confrim password Doesn't Match",
        });
    } else {
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);
      await userModel.findByIdAndUpdate(req.user._id, {
        $set: {
          password: newHashPassword,
        },
      });

      res
        .status(201)
        .send({ status: "Success", message: "Password Changed successfully" });
    }
  } else {
    res
      .status(400)
      .send({ status: "Failed", message: "All Fields are required" });
  }
};
