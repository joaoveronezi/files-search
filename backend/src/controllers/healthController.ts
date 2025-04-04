import { Controller, Get } from "@overnightjs/core";
import type { Request, Response } from "express";

@Controller("health")
export class HealthController {
  @Get("")
  public async checkHealth(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        message: "PDF Search API is running",
        endpoints: {
          health: "/health",
          uploadFile: "/api/files/upload",
          getFile: "/api/files/:id",
          search: "/api/search",
        },
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in health check:", error);
      res.status(500).json({ error: "Failed to check health" });
    }
  }
}
