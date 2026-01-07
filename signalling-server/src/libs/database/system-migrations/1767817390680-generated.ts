import { MigrationInterface, QueryRunner } from "typeorm";

export class Generated1767817390680 implements MigrationInterface {
    name = 'Generated1767817390680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" ALTER COLUMN "connection_type" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenant" ALTER COLUMN "username" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenant" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenant" ALTER COLUMN "host" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" ALTER COLUMN "host" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenant" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenant" ALTER COLUMN "username" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenant" ALTER COLUMN "connection_type" SET NOT NULL`);
    }

}
