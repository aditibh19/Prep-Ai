import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import dsaRouter from "./dsa";
import resumeRouter from "./resume";
import interviewsRouter from "./interviews";
import companiesRouter from "./companies";
import studyPlansRouter from "./study-plans";
import analyticsRouter from "./analytics";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(dsaRouter);
router.use(resumeRouter);
router.use(interviewsRouter);
router.use(companiesRouter);
router.use(studyPlansRouter);
router.use(analyticsRouter);
router.use(profileRouter);

export default router;
