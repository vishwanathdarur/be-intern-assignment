import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import { User } from './User';
import { Hashtag } from './Hashtag';

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'text' })
    content: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    author: User;

    @ManyToMany(() => Hashtag, (tag) => tag.posts)
    @JoinTable({
        name: 'posts_hashtags',
        joinColumn: { name: 'postId' },
        inverseJoinColumn: { name: 'hashtagId' },
    })
    hashtags: Hashtag[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}