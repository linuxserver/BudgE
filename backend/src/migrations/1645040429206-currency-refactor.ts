import { MigrationInterface, QueryRunner } from 'typeorm'

export class currencyRefactor1645040429206 implements MigrationInterface {
  name = 'currencyRefactor1645040429206'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_budgets" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "name" varchar NOT NULL, "toBeBudgeted" integer NOT NULL DEFAULT (0), "created" datetime NOT NULL DEFAULT (datetime('now')), "updated" datetime NOT NULL DEFAULT (datetime('now')), "currency" varchar NOT NULL DEFAULT ('USD'), CONSTRAINT "FK_27e688ddf1ff3893b43065899f9" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    )
    await queryRunner.query(
      `INSERT INTO "temporary_budgets"("id", "userId", "name", "toBeBudgeted", "created", "updated") SELECT "id", "userId", "name", "toBeBudgeted", "created", "updated" FROM "budgets"`,
    )
    await queryRunner.query(`DROP TABLE "budgets"`)
    await queryRunner.query(`ALTER TABLE "temporary_budgets" RENAME TO "budgets"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "budgets" RENAME TO "temporary_budgets"`)
    await queryRunner.query(
      `CREATE TABLE "budgets" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "name" varchar NOT NULL, "toBeBudgeted" integer NOT NULL DEFAULT (0), "created" datetime NOT NULL DEFAULT (datetime('now')), "updated" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_27e688ddf1ff3893b43065899f9" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    )
    await queryRunner.query(
      `INSERT INTO "budgets"("id", "userId", "name", "toBeBudgeted", "created", "updated") SELECT "id", "userId", "name", "toBeBudgeted", "created", "updated" FROM "temporary_budgets"`,
    )
    await queryRunner.query(`DROP TABLE "temporary_budgets"`)
  }
}
