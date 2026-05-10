import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./modules/auth/auth.route";
import users from "./modules/user/user.route";

const app = express();

const API_PREFIX = "/api/v1";

app.set("trust proxy", 1);
 
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const corsOptions = {
  origin:
    process.env.CORS_ORIGIN?.split(",") ?? [
      "https://thoratech-crm-frontend.vercel.app",
    ],
  credentials: true,
};

app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

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

app.use(
  `${API_PREFIX}/auth`,
  authRoutes
);
app.use(
  `${API_PREFIX}/users`,
  users
);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});



export default app;
