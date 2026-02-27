import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createUserSchema, updateUserSchema } from '../validations/user.validation';
import { UserController } from '../controllers/user.controller';
import { FollowController } from '../controllers/FollowController';

import { ActivityController } from "../controllers/ActivityController";

export const activityRouter = Router();
const activitycontroller = new ActivityController();


export const userRouter = Router();
const userController = new UserController();

export const followRouter = Router();
const controller = new FollowController();



userRouter.get('/', userController.getAllUsers.bind(userController));

// Get user by id
userRouter.get('/:id', userController.getUserById.bind(userController));

// Create new user
userRouter.post('/', validate(createUserSchema), userController.createUser.bind(userController));

// Update user
userRouter.put('/:id', validate(updateUserSchema), userController.updateUser.bind(userController));

// Delete user
userRouter.delete('/:id', userController.deleteUser.bind(userController));

userRouter.get('/:id/followers',controller.getFollowers.bind(controller))


userRouter.get('/:id/activity',activitycontroller.getUserActivity.bind(activitycontroller));