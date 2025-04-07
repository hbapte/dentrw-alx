
import express, { Express } from "express";
import dotenv from "dotenv";
import "./config/db";
import cors from "cors";
import indexRouter from "./routes/index";
import cookieParser from 'cookie-parser';
import swaggerSetup from './config/swagger';
import morgan from "morgan"
import httpStatus from "http-status"
import {
  securityHeaders,
  contentSecurityPolicy,
  corsOptions,
  preventClickjacking,
  addSecurityHeaders,
} from "./middlewares/security.middleware"
import { apiRateLimiter } from "./middlewares/rateLimiter.middleware";

dotenv.config(); 
const port = process.env.PORT;
const app: Express = express();
app.use(cors());


// Middleware
app.use(morgan("dev")) // Logging
app.use(express.json()) // Parse JSON bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies
app.use(cookieParser()) // Parse cookies

app.get('/', (req, res) => {
  res.send('Welcome to DentRW Express API!');
});


// Security middleware
app.use(securityHeaders)
app.use(contentSecurityPolicy)
app.use(corsOptions)
app.use(preventClickjacking)
app.use(addSecurityHeaders)


app.use('/api', indexRouter, apiRateLimiter); 


// Health check endpoint
app.get("/health", (req, res) => {
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: "Service is healthy",
    data: {
      uptime: process.uptime(),
      timestamp: Date.now(),
    },
  })
})

// 404 handler
app.use((req, res) => {
  res.status(httpStatus.NOT_FOUND).json({
    status: httpStatus.NOT_FOUND,
    message: "Resource not found",
    data: null,
  })
})

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, req: express.Request, res: express.Response) => {
  console.error(err.stack)

  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR
  const message = err.message || "Internal Server Error"

  res.status(statusCode).json({
    status: statusCode,
    message,
    data: null,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
})


swaggerSetup(app);
app.use((req, res) => { res.status(404).json({resStatus: false, resMsg: `[${req.method}] on [${req.path}] Prohibited` });});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;