import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from "dotenv";
import express from "express";
import { registerRoutes } from "../server/routes.js";
import { serveStatic } from "../server/vite.js";

// Load environment variables
dotenv.config();

// Create app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let initialized = false;

async function initializeApp() {
  if (initialized) return;
  
  try {
    // Setup routes
    await registerRoutes(app);
    
    // Error handling
    app.use((err: any, _req: any, res: any, _next: any) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error(err);
    });

    // Serve static files
    serveStatic(app);
    
    initialized = true;
  } catch (error) {
    console.error("Failed to initialize app:", error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await initializeApp();
  app(req, res);
}
