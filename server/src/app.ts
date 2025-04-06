import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import "./config/db";
import cors from "cors";
import indexRouter from "./routes/index";
const cookieParser = require('cookie-parser');
import swaggerSetup from './config/swagger';

dotenv.config(); 
const port = process.env.PORT;
const app: Express = express();
app.use(express.json());
app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Welcome to DentRW Express API!');
});

app.use('/api', indexRouter);

swaggerSetup(app);
app.use((req, res, next) => { res.status(404).json({resStatus: false, resMsg: `[${req.method}] on [${req.path}] Prohibited` });});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;