import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Post } from "../entities/Post";

export class HashtagController {
    private postRepository = AppDataSource.getRepository(Post);

    async getPostsByHashtag(req: Request, res: Response) {
        try {
            const tag = (req.params.tag || "").toLowerCase();
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = parseInt(req.query.offset as string) || 0;

            const posts = await this.postRepository
                .createQueryBuilder("post")
                .leftJoinAndSelect("post.author", "author")
                .leftJoinAndSelect("post.hashtags", "hashtag")
                .where("LOWER(hashtag.tag) = :tag", { tag })
                .orderBy("post.createdAt", "DESC")
                .skip(offset)
                .take(limit)
                .getMany();

            const result = posts.map(p => ({
                id: p.id,
                content: p.content,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                author: p.author,
                hashtags: p.hashtags,
            }));

            return res.json(result);
        } catch (error) {
            console.error("HASHTAG ERROR:", error);
            return res.status(500).json({ message: "Error fetching hashtag posts", error: String(error) });
        }
    }
}