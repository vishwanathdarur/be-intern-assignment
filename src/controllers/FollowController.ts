import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Follow } from '../entities/Follow';
import { User } from '../entities/User';
import { Activity } from "../entities/Activity";

export class FollowController {
    private followRepository = AppDataSource.getRepository(Follow);
    private userRepository = AppDataSource.getRepository(User);
    private activityRepository = AppDataSource.getRepository(Activity);

    async follow(req: Request, res: Response) {
        try {
            const followerId = parseInt(req.body.followerId);
            const followingId = parseInt(req.params.id);

            if (followerId === followingId)
                return res.status(400).json({ message: "You cannot follow yourself" });

            const follower = await this.userRepository.findOneBy({ id: followerId });
            const following = await this.userRepository.findOneBy({ id: followingId });

            if (!follower || !following)
                return res.status(404).json({ message: "User not found" });

            const existing = await this.followRepository.findOne({
                where: { follower: { id: followerId }, following: { id: followingId } },
            });

            if (existing)
                return res.status(400).json({ message: "Already following" });

            const followEntry = this.followRepository.create({
                follower,
                following,
            });

            await this.followRepository.save(followEntry);

            // ⭐ ACTIVITY LOGGING
            await this.activityRepository.save({
                type: "follow",
                actor: { id: followerId },
                targetUser: { id: followingId }
            });

            res.status(201).json({ message: "Followed successfully" });

        } catch (error) {
            res.status(500).json({ message: "Error while following", error });
        }
    }
    
    async unfollow(req: Request, res: Response) {
        try {
            const followerId = parseInt(req.body.followerId);
            const followingId = parseInt(req.params.id);

            const result = await this.followRepository.delete({
                follower: { id: followerId },
                following: { id: followingId },
            } as any);

            if (result.affected === 0)
                return res.status(400).json({ message: "Not following" });

            res.json({ message: "Unfollowed successfully" });

        } catch (error) {
            res.status(500).json({ message: "Error while unfollowing", error });
        }
    }

    async getFollowers(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = parseInt(req.query.offset as string) || 0;

            const followers = await this.followRepository.find({
                where: { following: { id: userId } },
                relations: ["follower"],
                order: { createdAt: "DESC" },
                skip: offset,
                take: limit
            });

            const total = await this.followRepository.count({
                where: { following: { id: userId } }
            });

            res.json({
                total,
                count: followers.length,
                followers: followers.map(f => f.follower)
            });

        } catch (error) {
            res.status(500).json({ message: "Error fetching followers", error });
        }
    }
}
