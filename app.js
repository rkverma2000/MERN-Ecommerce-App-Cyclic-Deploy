import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import productRoute from './routes/productRoute.js';
import cors from "cors";
import path from "path"

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './client/build')))

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/category', categoryRoute)
app.use('/api/v1/product', productRoute)

const PORT = process.env.PORT;

app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/build/index.html'))

})

app.listen(PORT, () => {

    console.log(`server running on ${PORT}`);

})