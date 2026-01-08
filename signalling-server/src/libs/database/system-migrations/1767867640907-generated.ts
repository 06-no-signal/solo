import { MigrationInterface, QueryRunner } from "typeorm";

export class Generated1767867640907 implements MigrationInterface {
    name = 'Generated1767867640907'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" ALTER COLUMN "name" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" ALTER COLUMN "name" DROP NOT NULL`);
    }

}
