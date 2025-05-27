import dotenv from "dotenv";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes.js";
import { serveStatic } from "../server/vite.js";

// Load environment variables
dotenv.config();

// Create app and setup routes
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let serverInstance: any = null;

async function setupServer() {
  if (serverInstance) return serverInstance;
  
  // Setup routes and get HTTP server
  const server = await registerRoutes(app);
  
  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });

  // Serve static files in production
  serveStatic(app);
  
  serverInstance = { app, server };
  return serverInstance;
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  const { app } = await setupServer();
  return app(req, res);
}
