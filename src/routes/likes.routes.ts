import { Router } from 'express';
import { LikeController } from '../controllers/LikeController';

export const likeRouter = Router();
const controller = new LikeController();

// Like a post
likeRouter.post('/:id/like', controller.likePost.bind(controller));

// Unlike a post
likeRouter.delete('/:id/like', controller.unlikePost.bind(controller));

// Get likes for a post
likeRouter.get('/:id', controller.getLikes.bind(controller));