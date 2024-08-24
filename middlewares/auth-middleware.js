import jwt from "jsonwebtoken";
import userModel from "../models/user.js";

var checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      // get Token From User
      token = authorization.split(" ")[1];

      // verify Token
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Get user From token

      req.user = await userModel.findById(userID).select("-password");
      next();
    } catch (error) {
      console.log(error);
      res.status(401).send({ status: "Failed", message: "Unauthorized User" });
    }
  }
  if (!token) {
    res
      .status(401)
      .send({ status: "Failed", message: "Unauthorized User no token" });
  }
};

export default checkUserAuth;
