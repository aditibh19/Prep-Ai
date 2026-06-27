import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, userProfilesTable, dsaProblemsTable, interviewSessionsTable } from "@workspace/db";
import { UpdateProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/profile", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;

  // Get or create profile
  let [profile] = await db.select().from(userProfilesTable).where(eq(userProfilesTable.userId, userId));

  if (!profile) {
    [profile] = await db
      .insert(userProfilesTable)
      .values({ userId, skills: [], projects: [], updatedAt: new Date() })
      .returning();
  }

  // Calculate preparation progress
  const [dsaProblems, interviews] = await Promise.all([
    db.select().from(dsaProblemsTable).where(eq(dsaProblemsTable.userId, userId)),
    db.select().from(interviewSessionsTable).where(eq(interviewSessionsTable.userId, userId)),
  ]);

  const dsaSolvedCount = dsaProblems.filter((p) => p.status === "Solved").length;
  const interviewCount = interviews.length;

  // Simple progress score: 0-100 based on problems solved + interviews done
  const dsaScore = Math.min(dsaSolvedCount / 2, 40); // up to 40 points from 80 solved problems
  const interviewScore = Math.min(interviewCount * 5, 30); // up to 30 points from 6 interviews
  const profileScore = (profile.skills?.length ?? 0) >= 3 ? 15 : (profile.skills?.length ?? 0) * 5; // up to 15 from skills
  const targetScore = profile.targetCompany ? 15 : 0; // 15 for having a target

  const preparationProgress = Math.min(Math.round(dsaScore + interviewScore + profileScore + targetScore), 100);

  res.json({
    userId,
    skills: profile.skills ?? [],
    projects: profile.projects ?? [],
    targetCompany: profile.targetCompany ?? null,
    targetRole: profile.targetRole ?? null,
    bio: profile.bio ?? null,
    college: profile.college ?? null,
    graduationYear: profile.graduationYear ?? null,
    preparationProgress,
  });
});

router.patch("/profile", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = req.user.id;

  // Upsert profile
  const existing = await db.select().from(userProfilesTable).where(eq(userProfilesTable.userId, userId));

  let profile;
  if (existing.length === 0) {
    [profile] = await db
      .insert(userProfilesTable)
      .values({ userId, ...parsed.data, updatedAt: new Date() })
      .returning();
  } else {
    [profile] = await db
      .update(userProfilesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(userProfilesTable.userId, userId))
      .returning();
  }

  const [dsaProblems, interviews] = await Promise.all([
    db.select().from(dsaProblemsTable).where(eq(dsaProblemsTable.userId, userId)),
    db.select().from(interviewSessionsTable).where(eq(interviewSessionsTable.userId, userId)),
  ]);

  const dsaSolvedCount = dsaProblems.filter((p) => p.status === "Solved").length;
  const interviewCount = interviews.length;
  const dsaScore = Math.min(dsaSolvedCount / 2, 40);
  const interviewScore = Math.min(interviewCount * 5, 30);
  const profileScore = (profile.skills?.length ?? 0) >= 3 ? 15 : (profile.skills?.length ?? 0) * 5;
  const targetScore = profile.targetCompany ? 15 : 0;
  const preparationProgress = Math.min(Math.round(dsaScore + interviewScore + profileScore + targetScore), 100);

  res.json({
    userId,
    skills: profile.skills ?? [],
    projects: profile.projects ?? [],
    targetCompany: profile.targetCompany ?? null,
    targetRole: profile.targetRole ?? null,
    bio: profile.bio ?? null,
    college: profile.college ?? null,
    graduationYear: profile.graduationYear ?? null,
    preparationProgress,
  });
});

export default router;
