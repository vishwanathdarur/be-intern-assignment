import { Router } from 'express';
import { HashtagController } from '../controllers/HashtagController';

export const hashtagRouter = Router();
const controller = new HashtagController();

// Get posts using a hashtag
hashtagRouter.get('/:tag', controller.getPostsByHashtag.bind(controller));