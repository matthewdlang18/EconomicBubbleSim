import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { SimulationWebSocketServer } from "./websocket";
import { insertGameSessionSchema, insertStudentDecisionSchema, insertClassroomSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Game session routes
  app.post('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertGameSessionSchema.parse({
        ...req.body,
        userId,
      });

      const session = await storage.createGameSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(400).json({ message: "Failed to create session" });
    }
  });

  app.get('/api/sessions/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const session = await storage.getUserActiveSession(userId);
      res.json(session);
    } catch (error) {
      console.error("Error fetching active session:", error);
      res.status(500).json({ message: "Failed to fetch active session" });
    }
  });

  app.get('/api/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getGameSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Check if user has access to this session
      const userId = req.user.claims.sub;
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  app.patch('/api/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify ownership
      const session = await storage.getGameSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedSession = await storage.updateGameSession(sessionId, req.body);
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(400).json({ message: "Failed to update session" });
    }
  });

  // Decision tracking routes
  app.get('/api/sessions/:id/decisions', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify access
      const session = await storage.getGameSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const decisions = await storage.getSessionDecisions(sessionId);
      res.json(decisions);
    } catch (error) {
      console.error("Error fetching decisions:", error);
      res.status(500).json({ message: "Failed to fetch decisions" });
    }
  });

  // Market events routes
  app.get('/api/sessions/:id/events', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify access
      const session = await storage.getGameSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const events = await storage.getSessionEvents(sessionId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Classroom session routes (for teachers)
  app.post('/api/classrooms', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.user.claims.sub;
      const classroomData = insertClassroomSessionSchema.parse({
        ...req.body,
        teacherId,
      });

      const classroom = await storage.createClassroomSession(classroomData);
      res.json(classroom);
    } catch (error) {
      console.error("Error creating classroom:", error);
      res.status(400).json({ message: "Failed to create classroom" });
    }
  });

  app.get('/api/classrooms', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.user.claims.sub;
      const classrooms = await storage.getTeacherClassrooms(teacherId);
      res.json(classrooms);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      res.status(500).json({ message: "Failed to fetch classrooms" });
    }
  });

  app.get('/api/classrooms/:id', isAuthenticated, async (req: any, res) => {
    try {
      const classroomId = parseInt(req.params.id);
      const classroom = await storage.getClassroomSession(classroomId);
      
      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found" });
      }

      res.json(classroom);
    } catch (error) {
      console.error("Error fetching classroom:", error);
      res.status(500).json({ message: "Failed to fetch classroom" });
    }
  });

  // Economic indicators endpoint
  app.get('/api/economic-indicators', async (req, res) => {
    try {
      // Return current economic indicators for the simulation
      const indicators = {
        fedRate: 2.25,
        unemploymentRate: 4.8,
        inflationRate: 2.1,
        housingStarts: 1800000,
        mortgageDelinquency: 2.1,
        priceToIncomeRatio: 3.8,
        inventoryMonths: 4.2,
        timestamp: Date.now(),
      };
      
      res.json(indicators);
    } catch (error) {
      console.error("Error fetching economic indicators:", error);
      res.status(500).json({ message: "Failed to fetch economic indicators" });
    }
  });

  // Historical data endpoint
  app.get('/api/historical-data', async (req, res) => {
    try {
      const { startYear = 2005, endYear = 2010 } = req.query;
      
      // Return historical housing data for educational comparison
      const historicalData = {
        priceData: [
          { year: 2005, quarter: 1, medianPrice: 220000, priceGrowth: 8.5 },
          { year: 2005, quarter: 2, medianPrice: 235000, priceGrowth: 12.1 },
          { year: 2005, quarter: 3, medianPrice: 248000, priceGrowth: 14.8 },
          { year: 2005, quarter: 4, medianPrice: 262000, priceGrowth: 16.2 },
          { year: 2006, quarter: 1, medianPrice: 275000, priceGrowth: 17.1 },
          { year: 2006, quarter: 2, medianPrice: 285000, priceGrowth: 15.8 },
          { year: 2006, quarter: 3, medianPrice: 292000, priceGrowth: 12.4 },
          { year: 2006, quarter: 4, medianPrice: 295000, priceGrowth: 8.9 },
          { year: 2007, quarter: 1, medianPrice: 294000, priceGrowth: 4.2 },
          { year: 2007, quarter: 2, medianPrice: 289000, priceGrowth: -1.2 },
          { year: 2007, quarter: 3, medianPrice: 278000, priceGrowth: -6.8 },
          { year: 2007, quarter: 4, medianPrice: 262000, priceGrowth: -12.4 },
          { year: 2008, quarter: 1, medianPrice: 245000, priceGrowth: -18.2 },
          { year: 2008, quarter: 2, medianPrice: 225000, priceGrowth: -22.8 },
          { year: 2008, quarter: 3, medianPrice: 208000, priceGrowth: -25.6 },
          { year: 2008, quarter: 4, medianPrice: 195000, priceGrowth: -26.2 },
          { year: 2009, quarter: 1, medianPrice: 185000, priceGrowth: -24.5 },
          { year: 2009, quarter: 2, medianPrice: 178000, priceGrowth: -20.9 },
          { year: 2009, quarter: 3, medianPrice: 175000, priceGrowth: -15.9 },
          { year: 2009, quarter: 4, medianPrice: 176000, priceGrowth: -9.7 },
        ],
        fedRateData: [
          { year: 2005, quarter: 1, rate: 2.25 },
          { year: 2005, quarter: 2, rate: 2.75 },
          { year: 2005, quarter: 3, rate: 3.25 },
          { year: 2005, quarter: 4, rate: 3.75 },
          { year: 2006, quarter: 1, rate: 4.25 },
          { year: 2006, quarter: 2, rate: 4.75 },
          { year: 2006, quarter: 3, rate: 5.00 },
          { year: 2006, quarter: 4, rate: 5.25 },
          { year: 2007, quarter: 1, rate: 5.25 },
          { year: 2007, quarter: 2, rate: 5.25 },
          { year: 2007, quarter: 3, rate: 5.00 },
          { year: 2007, quarter: 4, rate: 4.50 },
          { year: 2008, quarter: 1, rate: 3.00 },
          { year: 2008, quarter: 2, rate: 2.00 },
          { year: 2008, quarter: 3, rate: 1.50 },
          { year: 2008, quarter: 4, rate: 0.25 },
          { year: 2009, quarter: 1, rate: 0.25 },
          { year: 2009, quarter: 2, rate: 0.25 },
          { year: 2009, quarter: 3, rate: 0.25 },
          { year: 2009, quarter: 4, rate: 0.25 },
        ],
        events: [
          { year: 2005, quarter: 1, event: "Fed begins rate tightening cycle" },
          { year: 2006, quarter: 2, event: "Housing prices peak in many markets" },
          { year: 2007, quarter: 2, event: "Subprime mortgage crisis begins" },
          { year: 2007, quarter: 3, event: "Northern Rock bank run" },
          { year: 2008, quarter: 1, event: "Bear Stearns hedge funds collapse" },
          { year: 2008, quarter: 3, event: "Lehman Brothers bankruptcy" },
          { year: 2008, quarter: 4, event: "TARP bailout program enacted" },
          { year: 2009, quarter: 1, event: "Fed implements quantitative easing" },
        ],
      };
      
      res.json(historicalData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      res.status(500).json({ message: "Failed to fetch historical data" });
    }
  });

  // Export data for classroom analysis
  app.get('/api/sessions/:id/export', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify access
      const session = await storage.getGameSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const decisions = await storage.getSessionDecisions(sessionId);
      const events = await storage.getSessionEvents(sessionId);

      const exportData = {
        session,
        decisions,
        events,
        exportedAt: new Date().toISOString(),
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="session-${sessionId}-export.json"`);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting session data:", error);
      res.status(500).json({ message: "Failed to export session data" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  new SimulationWebSocketServer(httpServer);

  return httpServer;
}
