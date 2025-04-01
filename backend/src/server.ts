import cors from "cors";
import { config } from "dotenv";
import express from "express";
import fileRoutes from "./routes/fileRoutes";
import searchRoutes from "./routes/searchRoutes";

// Load environment variables
config();

// Create Express application
const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/files", fileRoutes);
app.use("/api/search", searchRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Basic root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "PDF Search API is running",
    endpoints: {
      health: "/health",
      uploadFile: "/api/files/upload",
      getFile: "/api/files/:id",
      search: "/api/search",
    },
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
