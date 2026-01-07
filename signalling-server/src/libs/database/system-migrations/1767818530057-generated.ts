import { MigrationInterface, QueryRunner } from "typeorm";

export class Generated1767818530057 implements MigrationInterface {
    name = 'Generated1767818530057'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" ALTER COLUMN "port" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" ALTER COLUMN "port" SET NOT NULL`);
    }

}
