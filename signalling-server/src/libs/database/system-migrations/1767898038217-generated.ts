import { MigrationInterface, QueryRunner } from "typeorm";

export class Generated1767898038217 implements MigrationInterface {
    name = 'Generated1767898038217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD CONSTRAINT "UQ_bdf67098380693c28389c2f29bb" UNIQUE ("host", "database_name", "port")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" DROP CONSTRAINT "UQ_bdf67098380693c28389c2f29bb"`);
        await queryRunner.query(`ALTER TABLE "tenant" ALTER COLUMN "name" DROP NOT NULL`);
    }

}
