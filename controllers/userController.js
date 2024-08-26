import userModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

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
      return res.status(400).send({
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

    return res.status(201).send({
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

          res.status(201).send({
            status: "Success",
            message: "Login successfully",
            token: token,
          });
        } else {
          res.status(400).send({
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
      res.status(400).send({
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

export let loggedUser = (req, res) => {
  res.send({ user: req.user });
};

// Send Password Reset Link To the registered email
export let sendUserPasswordResetEmail = async (req, res) => {
  let { email } = req.body;
  if (email) {
    const user = await userModel.findOne({ email: email });
    if (user) {
      const secret = user._id + process.env.JWT_SECRET_KEY;
      const token = jwt.sign({ user_ID: user._id }, secret, {
        expiresIn: "15m",
      });
      const link = `http:127.0.0.1:3000/user/reset/${user._id}/${token}`
      // console.log(link)

      //Send Email to user for reset Password
      let info = await transporter.sendMail({
        from : 'haidar',
        to : user.email,
        subject : `EXPRESS_AUTH_JWT - Reset Link`,
        html : `<a href = ${link}>Click</a>here to reset Your Password`
      })

      res
        .status(201)
        .send({
          status: "Success",
          message: "Password Reset link sent Successfully to the email Please Check your Email", info,
        });
    } else {
      res
        .status(400)
        .send({ status: "falied", message: "Enter Valid Email id or Sign up" });
    }
  } else {
    res
      .status(400)
      .send({ status: "falied", message: "All fields are Required" });
  }
};

// Reseting the User password and saving in database

export let userPasswordReset = async (req,res) => {
  const {password, password_confirmation} = req.body
  const {id, token} = req.params
  const user = await userModel.findById(id)
  const newSecret = user._id + process.env.JWT_SECRET_KEY
  try {
    jwt.verify(token,newSecret)
    if(password && password_confirmation){
      if(password !== password_confirmation){
        res
      .status(400)
      .send({ status: "falied", message: "Password and Confirm password is not same" });
      }else{
        const  salt = await bcrypt.genSalt(10)
        const newHashPassword = await bcrypt.hash(password, salt)
        await userModel.findByIdAndUpdate(user._id,{$set:{password : newHashPassword}})
        res
      .status(201)
      .send({ status: "Success", message: "Password Reset Successfully" });
      }
    }else{
      res
      .status(400)
      .send({ status: "falied", message: "All fields are Required" });
    }
  } catch (error) {
    
  }


}