import 'reflect-metadata'; 
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import appRoutes from "./routes/app.route";
import path from "path";
import fs from "fs";
import { errorHandler } from './utils/errorHandler';

dotenv.config();

const app = express();

if (!fs.existsSync(path.resolve(process.env.APP_TEMP_DIR || "./downloads"))) {
  fs.mkdirSync(path.resolve(process.env.APP_TEMP_DIR || "./downloads"), { recursive: true });

}

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.use("/api/tiktok", appRoutes);

app.use(errorHandler);

export default app;