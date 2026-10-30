const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const tripRoutes = require("./routes/tripRoutes");
const userRoutes = require("./routes/userRoutes");
const assistantRoutes = require("./routes/assistantRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? configuredOrigins
    : ["http://localhost:5173", "http://127.0.0.1:5173", ...configuredOrigins];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Discover Jordan API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server.",
  });
});

module.exports = app;
