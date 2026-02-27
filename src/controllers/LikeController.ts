import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Like } from '../entities/Like';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Activity } from "../entities/Activity";

export class LikeController {
    private likeRepository = AppDataSource.getRepository(Like);
    private userRepository = AppDataSource.getRepository(User);
    private postRepository = AppDataSource.getRepository(Post);
    private activityRepository = AppDataSource.getRepository(Activity);

    async likePost(req: Request, res: Response) {
        try {
            const userId = parseInt(req.body.userId);
            const postId = parseInt(req.params.id);

            const user = await this.userRepository.findOneBy({ id: userId });
            const post = await this.postRepository.findOneBy({ id: postId });

            if (!user || !post) {
                return res.status(404).json({ message: 'User or Post not found' });
            }

            // Check if already liked
            const existing = await this.likeRepository.findOne({
                where: { user: { id: userId }, post: { id: postId } },
            });

            if (existing) {
                return res.status(400).json({ message: 'Already liked' });
            }

            const like = this.likeRepository.create({ user, post });
            await this.likeRepository.save(like);

            // ⭐ LOG ACTIVITY HERE
            await this.activityRepository.save({
                type: "like",
                actor: { id: userId },
                post: { id: postId }
            });

            res.status(201).json({ message: 'Post liked successfully' });

        } catch (error) {
            res.status(500).json({ message: 'Error liking post', error });
        }
    }
    async unlikePost(req: Request, res: Response) {
        try {
            const userId = parseInt(req.body.userId);
            const postId = parseInt(req.params.id);

            const result = await this.likeRepository.delete({
                user: { id: userId },
                post: { id: postId },
            } as any);

            if (result.affected === 0) {
                return res.status(400).json({ message: 'You have not liked this post' });
            }

            res.json({ message: 'Post unliked successfully' });

        } catch (error) {
            res.status(500).json({ message: 'Error unliking post', error });
        }
    }

    async getLikes(req: Request, res: Response) {
        try {
            const postId = parseInt(req.params.id);

            const likes = await this.likeRepository.find({
                where: { post: { id: postId } },
                relations: ['user'],
            });

            res.json({
                count: likes.length,
                users: likes.map(like => like.user),
            });

        } catch (error) {
            res.status(500).json({ message: 'Error getting likes', error });
        }
    }
}