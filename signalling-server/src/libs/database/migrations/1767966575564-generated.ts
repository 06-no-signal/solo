import { MigrationInterface, QueryRunner } from "typeorm";

export class Generated1767966575564 implements MigrationInterface {
    name = 'Generated1767966575564'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "keycloakId" character varying NOT NULL, CONSTRAINT "UQ_7c4efc5ecbdbcb378b7a43fa011" UNIQUE ("keycloakId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
