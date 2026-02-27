import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePostsHashtagsTable1713427203000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'posts_hashtags',
                columns: [
                    {
                        name: 'postId',
                        type: 'integer',
                        isPrimary: true,
                    },
                    {
                        name: 'hashtagId',
                        type: 'integer',
                        isPrimary: true,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['postId'],
                        referencedTableName: 'posts',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                    {
                        columnNames: ['hashtagId'],
                        referencedTableName: 'hashtags',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('posts_hashtags');
    }
}