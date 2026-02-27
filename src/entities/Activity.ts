import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn
} from 'typeorm';

import { User } from './User';
import { Post } from './Post';

@Entity('activities')
export class Activity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    type: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    actor: User;

    @ManyToOne(() => Post, { nullable: true, onDelete: 'SET NULL' })
    post: Post;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    targetUser: User;

    @CreateDateColumn()
    createdAt: Date;
}