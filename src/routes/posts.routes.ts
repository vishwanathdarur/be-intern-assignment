import { Router } from 'express';
import { PostController } from '../controllers/PostController';
import { HashtagController } from '../controllers/HashtagController';

export const postRouter = Router();
const controller = new PostController();
export const hashtagRouter = Router();
const hashtagcontroller = new HashtagController();
// Get all users
// Get all posts
postRouter.get('/', controller.getAllPosts.bind(controller));

// Get one post
postRouter.get('/:id', controller.getPostById.bind(controller));

// Create post
postRouter.post('/', controller.createPost.bind(controller));

// Update post
postRouter.put('/:id', controller.updatePost.bind(controller));

// Delete post
postRouter.delete('/:id', controller.deletePost.bind(controller));

postRouter.get('/hashtag/:id',hashtagcontroller.getPostsByHashtag.bind(hashtagcontroller));