import { MigrationInterface, QueryRunner } from "typeorm";

export class DocumentEntity1742495779281 implements MigrationInterface {
    name = 'DocumentEntity1742495779281'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."documents_document_status_enum" AS ENUM('processing', 'uploaded', 'failed')`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "key" character varying NOT NULL, "mime_type" character varying NOT NULL, "document_status" "public"."documents_document_status_enum" NOT NULL DEFAULT 'processing', "object_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_c7481daf5059307842edef74d73" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_c7481daf5059307842edef74d73"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TYPE "public"."documents_document_status_enum"`);
    }

}
