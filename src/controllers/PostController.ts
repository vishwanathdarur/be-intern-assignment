import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Post } from '../entities/Post';
import { User } from '../entities/User';
import { Hashtag } from '../entities/Hashtag';
import { Activity } from "../entities/Activity"
;
export class PostController {
    private postRepository = AppDataSource.getRepository(Post);
    private userRepository = AppDataSource.getRepository(User);
    private hashtagRepository = AppDataSource.getRepository(Hashtag);
    private activityRepository = AppDataSource.getRepository(Activity);

    extractHashtags(content: string): string[] {
        const regex = /#(\w+)/g;
        const tags = [];
        let match;
        while ((match = regex.exec(content))) {
            tags.push(match[1].toLowerCase());
        }
        return tags;
    }

    async createPost(req: Request, res: Response) {
        try {
            const { authorId, content } = req.body;

            const user = await this.userRepository.findOneBy({ id: authorId });
            if (!user) {
                return res.status(404).json({ message: 'Author not found' });
            }

            const tags = this.extractHashtags(content);

            const hashtags = [];
            for (const tag of tags) {
                let hashtag = await this.hashtagRepository.findOneBy({ tag });
                if (!hashtag) {
                    hashtag = this.hashtagRepository.create({ tag });
                    await this.hashtagRepository.save(hashtag);
                }
                hashtags.push(hashtag);
            }

            const post = this.postRepository.create({
                content,
                author: user,
                hashtags,
            });

            const saved = await this.postRepository.save(post);

            // ⭐ ADD ACTIVITY LOGGING
            await this.activityRepository.save({
                type: "post",
                actor: { id: authorId },
                post: saved
            });

            res.status(201).json(saved);

        } catch (error) {
            res.status(500).json({ message: 'Error creating post', error });
        }
    }
    
    async getAllPosts(req: Request, res: Response) {
        try {
            const posts = await this.postRepository.find({
                relations: ['author', 'hashtags'],
            });
            res.json(posts);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching posts', error });
        }
    }

    async getPostById(req: Request, res: Response) {
        try {
            const post = await this.postRepository.findOne({
                where: { id: parseInt(req.params.id) },
                relations: ['author', 'hashtags']
            });

            if (!post) return res.status(404).json({ message: 'Post not found' });
            res.json(post);

        } catch (error) {
            res.status(500).json({ message: 'Error fetching post', error });
        }
    }

    async updatePost(req: Request, res: Response) {
        try {
            const post = await this.postRepository.findOneBy({
                id: parseInt(req.params.id),
            });

            if (!post) return res.status(404).json({ message: 'Post not found' });

            this.postRepository.merge(post, req.body);
            const updated = await this.postRepository.save(post);
            res.json(updated);

        } catch (error) {
            res.status(500).json({ message: 'Error updating post', error });
        }
    }

    async deletePost(req: Request, res: Response) {
        try {
            const result = await this.postRepository.delete(parseInt(req.params.id));

            if (result.affected === 0)
                return res.status(404).json({ message: 'Post not found' });

            res.status(204).send();

        } catch (error) {
            res.status(500).json({ message: 'Error deleting post', error });
        }
    }
    
}