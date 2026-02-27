import { Router } from "express";
import { ActivityController } from "../controllers/ActivityController";

export const activityRouter = Router();
const controller = new ActivityController();

activityRouter.get("/:id", controller.getUserActivity.bind(controller));