import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Post } from './Post';

@Entity('likes')
export class Like {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Post, { onDelete: 'CASCADE' })
    post: Post;

    @CreateDateColumn()
    createdAt: Date;
}