import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Activity } from "../entities/Activity";

export class ActivityController {
    private repo = AppDataSource.getRepository(Activity);

    async getUserActivity(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);
            const type = req.query.type as string;
            const from = req.query.from as string;
            const to = req.query.to as string;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = parseInt(req.query.offset as string) || 0;

            const where: any = {
                actor: { id: userId }
            };

            if (type) where.type = type;
            if (from) where.createdAt = { $gte: new Date(from) };
            if (to) where.createdAt = { $lte: new Date(to) };

            const activity = await this.repo.find({
                where,
                relations: ["post", "actor", "targetUser"],
                order: { createdAt: "DESC" },
                skip: offset,
                take: limit
            });

            res.json(activity);

        } catch (error) {
            res.status(500).json({ message: "Error fetching activity", error });
        }
    }
}