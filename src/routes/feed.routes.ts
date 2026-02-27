import { Router } from "express";
import { FeedController } from "../controllers/FeedController";

export const feedRouter = Router();
const controller = new FeedController();

feedRouter.get("/", controller.getFeed.bind(controller));