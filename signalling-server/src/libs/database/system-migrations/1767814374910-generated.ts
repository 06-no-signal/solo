import { MigrationInterface, QueryRunner } from "typeorm";

export class Generated1767814374910 implements MigrationInterface {
    name = 'Generated1767814374910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tenant" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "connection_type" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "host" character varying NOT NULL, "database_name" character varying NOT NULL, "port" integer NOT NULL, CONSTRAINT "PK_da8c6efd67bb301e810e56ac139" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tenant"`);
    }

}
