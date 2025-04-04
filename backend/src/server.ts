import { Server } from "@overnightjs/core";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import { FileController } from "./controllers/fileController";
import { HealthController } from "./controllers/healthController";
import { SearchController } from "./controllers/searchController";

// Load environment variables
config();

export class SetupServer extends Server {
  constructor(private port = process.env.PORT || 3000) {
    super();
  }

  public setup() {
    this.app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  public setupControllers() {
    const fileController = new FileController();
    const searchController = new SearchController();
    const healthCheckController = new HealthController();

    this.addControllers([
      fileController,
      searchController,
      healthCheckController,
    ]);
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  }

  public init() {
    this.setup();
    this.setupControllers();
  }

  public getApp() {
    return this.app;
  }
}
