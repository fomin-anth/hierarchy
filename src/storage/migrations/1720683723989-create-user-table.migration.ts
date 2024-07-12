import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1720683723989 implements MigrationInterface {
  name = 'CreateUserTable1720683723989';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "users" (
        "id" serial PRIMARY KEY,
        "name" character varying NOT NULL,
        "supervisorId" integer
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "users"
    `);
  }
}
