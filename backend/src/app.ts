import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

const app = express();

const API_PREFIX = "/api/v1";

app.set("trust proxy", 1);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN?.split(",") ?? [
        "http://localhost:5173",
      ],
    credentials: true,
  })
);

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get(`${API_PREFIX}/health`, (_, res) => {
  res.status(200).json({
    success: true,
    message: "CRM API Running",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

export default app;
