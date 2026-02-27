import { Router } from 'express';
import { FollowController } from '../controllers/FollowController';

export const followRouter = Router();
const controller = new FollowController();

// Follow a user
followRouter.post('/:id/follow', controller.follow.bind(controller));

// Unfollow a user
followRouter.delete('/:id/follow', controller.unfollow.bind(controller));

// Get followers of a user
followRouter.get('/:id/followers', controller.getFollowers.bind(controller));