import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Activity } from "../entities/Activity";
import { Follow } from "../entities/Follow";
import { Post } from "../entities/Post";
import { Like } from "../entities/Like";
import { In } from "typeorm";

export class FeedController {
    private activityRepo = AppDataSource.getRepository(Activity);
    private followRepo = AppDataSource.getRepository(Follow);
    private postRepo = AppDataSource.getRepository(Post);
    private likeRepo = AppDataSource.getRepository(Like);

    async getFeed(req: Request, res: Response) {
        try {
            const userId = parseInt(req.query.userId as string);
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = parseInt(req.query.offset as string) || 0;

            if (!userId) {
                return res.status(400).json({ message: "userId is required" });
            }

            const follows = await this.followRepo.find({
                where: { follower: { id: userId } },
                relations: ["following"]
            });

            const followingIds = follows.map(f => f.following.id);

            if (followingIds.length === 0) {
                return res.json({ feed: [], count: 0 });
            }

            const activities = await this.activityRepo.find({
                where: {
                    type: "post",
                    actor: { id: In(followingIds) }
                },
                relations: ["post", "actor"],
                order: { createdAt: "DESC" },
                skip: offset,
                take: limit
            });

            for (const a of activities) {
                const likeCount = await this.likeRepo.count({
                    where: { post: { id: a.post.id } }
                });
                (a as any).likeCount = likeCount;
            }

            res.json({
                count: activities.length,
                feed: activities
            });

        } catch (error) {
            res.status(500).json({ message: "Error generating feed", error });
        }
    }
}