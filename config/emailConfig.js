import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "haidarshaikh831@gmail.com",
      pass: "hifi ypeo xksp gpho",
    },
  });

export default transporter;
