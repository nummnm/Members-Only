require("dotenv").config();

const express = require("express");
const path = require("node:path");
const fs = require("node:fs");
const { randomBytes } = require("node:crypto");

const passport = require("./config/passport");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./db/pool");
const initializeDatabase = require("./db/initDatabase");

const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const messageRouter = require("./routes/messageRouter");

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET must be set in the environment");
}
if (!process.env.SESSION_SECRET) {
  const secretPath = path.join(__dirname, ".session-secret");
  try {
    sessionSecret = fs.readFileSync(secretPath, "utf8").trim();
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    sessionSecret = randomBytes(32).toString("hex");
    try {
      fs.writeFileSync(secretPath, sessionSecret, { encoding: "utf8", flag: "wx", mode: 0o600 });
    } catch (writeError) {
      if (writeError.code !== "EEXIST") throw writeError;
      sessionSecret = fs.readFileSync(secretPath, "utf8").trim();
    }
  }
  if (!sessionSecret) throw new Error("Development session secret could not be loaded");
  console.warn("SESSION_SECRET is unset; using the persistent local development secret.");
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  store: new pgSession({
    pool,
    createTableIfMissing: true,
  }),
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", messageRouter);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize the database:", error);
    await pool.end();
    process.exitCode = 1;
  }
}

startServer();