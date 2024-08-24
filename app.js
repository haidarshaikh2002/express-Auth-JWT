import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import connectDB from './config/connectdb.js';
import userRouter from './routes/userRoutes.js';

const app = express();
dotenv.config();

// getting Dotenv Files 
let PORT = process.env.PORT;

// Connecting To Database
let DATABASE_URL = process.env.DATABASE_URL;
let DATABASE_NAME = process.env.DATABASE_NAME;
connectDB(DATABASE_URL,DATABASE_NAME)

// CORS Policy
app.use(cors())

// JSON
app.use(express.json());

// Load Routes 
app.use('/user', userRouter)


app.listen(PORT, ()=>{
    console.log(`Server is Running on Port Number ${PORT}`);
})