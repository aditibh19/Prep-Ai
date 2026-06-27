import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./auth";

// DSA Problems
export const dsaProblemsTable = pgTable("dsa_problems", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Resume Reports
export const resumeReportsTable = pgTable("resume_reports", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  rawText: text("raw_text"),
  atsScore: real("ats_score").notNull(),
  missingSkills: jsonb("missing_skills").$type<string[]>().notNull().default([]),
  improvements: jsonb("improvements").$type<string[]>().notNull().default([]),
  projectsFeedback: text("projects_feedback").notNull().default(""),
  interviewQuestions: jsonb("interview_questions").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Interview Sessions
export const interviewSessionsTable = pgTable("interview_sessions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  difficulty: text("difficulty").notNull(),
  status: text("status").notNull().default("active"),
  overallScore: real("overall_score"),
  confidence: real("confidence"),
  communication: real("communication"),
  technicalSkills: real("technical_skills"),
  strongAreas: jsonb("strong_areas").$type<string[]>().notNull().default([]),
  weakAreas: jsonb("weak_areas").$type<string[]>().notNull().default([]),
  recommendedTopics: jsonb("recommended_topics").$type<string[]>().notNull().default([]),
  questionCount: integer("question_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Interview Messages
export const interviewMessagesTable = pgTable("interview_messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => interviewSessionsTable.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  score: real("score"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Companies
export const companiesTable = pgTable("companies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  topics: jsonb("topics").$type<string[]>().notNull().default([]),
  difficulty: text("difficulty").notNull().default("Hard"),
});

// Study Plans
export const studyPlansTable = pgTable("study_plans", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  targetCompany: text("target_company").notNull(),
  daysLeft: integer("days_left").notNull(),
  weeks: jsonb("weeks")
    .$type<Array<{ week: number; topics: string[]; description: string }>>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Profiles
export const userProfilesTable = pgTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  projects: jsonb("projects").$type<string[]>().notNull().default([]),
  targetCompany: text("target_company"),
  targetRole: text("target_role"),
  bio: text("bio"),
  college: text("college"),
  graduationYear: integer("graduation_year"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas — generatedAlwaysAsIdentity columns are already excluded
export const insertDsaProblemSchema = createInsertSchema(dsaProblemsTable).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResumeReportSchema = createInsertSchema(resumeReportsTable).omit({
  userId: true,
  createdAt: true,
});

export const insertInterviewSessionSchema = createInsertSchema(interviewSessionsTable).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInterviewMessageSchema = createInsertSchema(interviewMessagesTable).omit({
  createdAt: true,
});

export const insertStudyPlanSchema = createInsertSchema(studyPlansTable).omit({
  userId: true,
  createdAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfilesTable).omit({
  userId: true,
  updatedAt: true,
});

export type DsaProblem = typeof dsaProblemsTable.$inferSelect;
export type ResumeReport = typeof resumeReportsTable.$inferSelect;
export type InterviewSession = typeof interviewSessionsTable.$inferSelect;
export type InterviewMessage = typeof interviewMessagesTable.$inferSelect;
export type Company = typeof companiesTable.$inferSelect;
export type StudyPlan = typeof studyPlansTable.$inferSelect;
export type UserProfile = typeof userProfilesTable.$inferSelect;
