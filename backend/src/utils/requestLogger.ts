import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Logger from "./logger";
import { LOGGER_TAGS } from "./tags";

export function logRequestCost(req: Request, res: Response, next: any) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      time: new Date().toISOString(),
      route: req.originalUrl,
      durationMs: duration,
      costUSD: res.locals.cost || 0,
      cached: res.locals.cached || false,
    };

    Logger.log(LOGGER_TAGS.LOGGING_REQUEST);

    const logDir = path.join(__dirname, "../../logs");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    fs.appendFileSync(path.join(logDir, "cost-metrics.log"), JSON.stringify(logData) + "\n");
  });

  next();
}
