import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    CreateDateColumn
} from 'typeorm';
import { Post } from './Post';

@Entity('hashtags')
export class Hashtag {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', unique: true })
    tag: string;

    @ManyToMany(() => Post, (post) => post.hashtags)
    posts: Post[];

    @CreateDateColumn()
    createdAt: Date;
}