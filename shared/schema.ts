import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  real,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Game sessions for tracking student progress
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionName: varchar("session_name").notNull(),
  currentRole: varchar("current_role").notNull().default("homebuyer"),
  gameState: jsonb("game_state").notNull(),
  marketState: jsonb("market_state").notNull(),
  policyState: jsonb("policy_state").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student decisions for educational analysis
export const studentDecisions = pgTable("student_decisions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => gameSessions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").notNull(),
  decisionType: varchar("decision_type").notNull(),
  decisionData: jsonb("decision_data").notNull(),
  marketContext: jsonb("market_context").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Market events for historical tracking
export const marketEvents = pgTable("market_events", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => gameSessions.id),
  eventType: varchar("event_type").notNull(),
  eventData: jsonb("event_data").notNull(),
  triggeredBy: varchar("triggered_by"),
  impact: jsonb("impact").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Classroom analytics
export const classroomSessions = pgTable("classroom_sessions", {
  id: serial("id").primaryKey(),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  sessionName: varchar("session_name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  settings: jsonb("settings").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;

export type InsertStudentDecision = typeof studentDecisions.$inferInsert;
export type StudentDecision = typeof studentDecisions.$inferSelect;

export type InsertMarketEvent = typeof marketEvents.$inferInsert;
export type MarketEvent = typeof marketEvents.$inferSelect;

export type InsertClassroomSession = typeof classroomSessions.$inferInsert;
export type ClassroomSession = typeof classroomSessions.$inferSelect;

// Type exports for client-side use
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;

// Schemas for validation
export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentDecisionSchema = createInsertSchema(studentDecisions).omit({
  id: true,
  timestamp: true,
});

export const insertMarketEventSchema = createInsertSchema(marketEvents).omit({
  id: true,
  timestamp: true,
});

export const insertClassroomSessionSchema = createInsertSchema(classroomSessions).omit({
  id: true,
  createdAt: true,
});
