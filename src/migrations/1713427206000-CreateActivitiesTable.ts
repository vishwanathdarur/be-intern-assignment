import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateActivitiesTable1713427206000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'activities',
                columns: [
                    {
                        name: 'id',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'type',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'actorId',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'postId',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'targetUserId',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['actorId'],
                        referencedTableName: 'users',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                    {
                        columnNames: ['postId'],
                        referencedTableName: 'posts',
                        referencedColumnNames: ['id'],
                        onDelete: 'SET NULL',
                    },
                    {
                        columnNames: ['targetUserId'],
                        referencedTableName: 'users',
                        referencedColumnNames: ['id'],
                        onDelete: 'SET NULL',
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('activities');
    }
}