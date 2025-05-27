import {
  users,
  gameSessions,
  studentDecisions,
  marketEvents,
  classroomSessions,
  type User,
  type UpsertUser,
  type GameSession,
  type InsertGameSession,
  type StudentDecision,
  type InsertStudentDecision,
  type MarketEvent,
  type InsertMarketEvent,
  type ClassroomSession,
  type InsertClassroomSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Game session operations
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getGameSession(id: number): Promise<GameSession | undefined>;
  getUserActiveSession(userId: string): Promise<GameSession | undefined>;
  updateGameSession(id: number, updates: Partial<InsertGameSession>): Promise<GameSession>;
  
  // Student decision tracking
  recordDecision(decision: InsertStudentDecision): Promise<StudentDecision>;
  getSessionDecisions(sessionId: number): Promise<StudentDecision[]>;
  
  // Market event tracking
  recordMarketEvent(event: InsertMarketEvent): Promise<MarketEvent>;
  getSessionEvents(sessionId: number): Promise<MarketEvent[]>;
  
  // Classroom operations
  createClassroomSession(session: InsertClassroomSession): Promise<ClassroomSession>;
  getTeacherClassrooms(teacherId: string): Promise<ClassroomSession[]>;
  getClassroomSession(id: number): Promise<ClassroomSession | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Game session operations
  async createGameSession(sessionData: InsertGameSession): Promise<GameSession> {
    const [session] = await db
      .insert(gameSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getGameSession(id: number): Promise<GameSession | undefined> {
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, id));
    return session;
  }

  async getUserActiveSession(userId: string): Promise<GameSession | undefined> {
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(and(eq(gameSessions.userId, userId), eq(gameSessions.isActive, true)))
      .orderBy(desc(gameSessions.createdAt))
      .limit(1);
    return session;
  }

  async updateGameSession(id: number, updates: Partial<InsertGameSession>): Promise<GameSession> {
    const [session] = await db
      .update(gameSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(gameSessions.id, id))
      .returning();
    return session;
  }

  // Student decision tracking
  async recordDecision(decisionData: InsertStudentDecision): Promise<StudentDecision> {
    const [decision] = await db
      .insert(studentDecisions)
      .values(decisionData)
      .returning();
    return decision;
  }

  async getSessionDecisions(sessionId: number): Promise<StudentDecision[]> {
    return await db
      .select()
      .from(studentDecisions)
      .where(eq(studentDecisions.sessionId, sessionId))
      .orderBy(desc(studentDecisions.timestamp));
  }

  // Market event tracking
  async recordMarketEvent(eventData: InsertMarketEvent): Promise<MarketEvent> {
    const [event] = await db
      .insert(marketEvents)
      .values(eventData)
      .returning();
    return event;
  }

  async getSessionEvents(sessionId: number): Promise<MarketEvent[]> {
    return await db
      .select()
      .from(marketEvents)
      .where(eq(marketEvents.sessionId, sessionId))
      .orderBy(desc(marketEvents.timestamp));
  }

  // Classroom operations
  async createClassroomSession(sessionData: InsertClassroomSession): Promise<ClassroomSession> {
    const [session] = await db
      .insert(classroomSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getTeacherClassrooms(teacherId: string): Promise<ClassroomSession[]> {
    return await db
      .select()
      .from(classroomSessions)
      .where(eq(classroomSessions.teacherId, teacherId))
      .orderBy(desc(classroomSessions.createdAt));
  }

  async getClassroomSession(id: number): Promise<ClassroomSession | undefined> {
    const [session] = await db
      .select()
      .from(classroomSessions)
      .where(eq(classroomSessions.id, id));
    return session;
  }
}

export const storage = new DatabaseStorage();
