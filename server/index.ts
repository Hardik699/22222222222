import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { attachIdentity, requireAdmin } from "./middleware/auth";
import { salariesRouter } from "./routes/salaries";
import {
  getSpreadsheetInfo,
  syncMasterDataToGoogleSheets,
  getHRSpreadsheetInfo,
  syncHRDataToGoogleSheets,
} from "./services/googleSheets";

const HAS_DB = !!process.env.DATABASE_URL;

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(attachIdentity);

  // Static for uploaded files
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Salaries API
  app.use("/api/salaries", salariesRouter());

  // One-time migration (file store -> Postgres/Neon)
  if (HAS_DB) {
    app.post("/api/migrate-to-postgres", requireAdmin, async (req, res, next) => {
      try {
        const mod = await import("./routes/migrate");
        return mod.migrateSalariesToPostgres(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  }

  // Google Sheets integration (admin only recommended on client)
  app.post("/api/google-sheets/sync-master-data", syncMasterDataToGoogleSheets);
  app.get("/api/google-sheets/info", getSpreadsheetInfo);

  // HR Google Sheets (separate spreadsheet)
  app.post("/api/google-sheets/sync-hr", syncHRDataToGoogleSheets);
  app.get("/api/google-sheets/info-hr", getHRSpreadsheetInfo);

  return app;
}
