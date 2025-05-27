import dotenv from "dotenv";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Setup server
let server: any;

async function setupServer() {
  if (!server) {
    server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error(err);
    });

    // Setup serving (development vs production)
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
  }
  return { app, server };
}

// For Vercel serverless functions
export default async function handler(req: any, res: any) {
  const { app } = await setupServer();
  return app(req, res);
}

// For local development and traditional hosting
if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
  setupServer().then(({ server }) => {
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
    server.listen(port, host, () => {
      log(`serving on ${host}:${port}`);
    });
  });
}
