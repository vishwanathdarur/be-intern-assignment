import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn
} from 'typeorm';
import { User } from './User';

@Entity('follows')
export class Follow {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    follower: User;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    following: User;

    @CreateDateColumn()
    createdAt: Date;
}