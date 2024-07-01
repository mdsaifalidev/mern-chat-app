import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import "./utils/passport.js";
import verifyJwt from "./middlewares/auth.middleware.js";
import { app, server } from "./socket/socket.js";
import path from "path";

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
import userRouter from "./routes/user.route.js";
import messageRouter from "./routes/message.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/messages", verifyJwt, messageRouter);

// static files
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
  return res.sendFile(path.join(__dirname, "/frontend/dist/index.html"));
});

// error handler
import errorHandler from "./middlewares/error.middleware.js";

app.use(errorHandler);

// connect to the database
import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Error connecting to the database: ${error.message}`);
  });
