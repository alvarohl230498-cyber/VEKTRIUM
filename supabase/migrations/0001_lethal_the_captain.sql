CREATE TYPE "public"."client_confidentiality" AS ENUM('publico', 'interno', 'confidencial');--> statement-breakpoint
CREATE TYPE "public"."client_size" AS ENUM('micro', 'pequena', 'mediana', 'grande');--> statement-breakpoint
CREATE TYPE "public"."opportunity_status" AS ENUM('nuevo_lead', 'contactado', 'diagnostico_agendado', 'diagnostico_realizado', 'preparando_propuesta', 'propuesta_enviada', 'en_negociacion', 'ganado', 'no_aceptado', 'sin_respuesta', 'pospuesto', 'descalificado', 'archivado');--> statement-breakpoint
CREATE TYPE "public"."project_health" AS ENUM('sano', 'en_riesgo', 'critico');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('activo', 'archivado');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pendiente', 'lista_para_iniciar', 'en_progreso', 'en_revision', 'bloqueada', 'esperando_cliente', 'completada', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."attendee_response" AS ENUM('pendiente', 'aceptado', 'declinado');--> statement-breakpoint
CREATE TYPE "public"."meeting_sync_status" AS ENUM('pendiente', 'sincronizada', 'fallida');--> statement-breakpoint
CREATE TYPE "public"."meeting_type" AS ENUM('contacto_inicial', 'descubrimiento', 'levantamiento', 'validacion', 'revision_avance', 'presentacion_prototipo', 'presentacion_final', 'entrega_capacitacion', 'seguimiento_postentrega', 'reunion_interna');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legal_name" text NOT NULL,
	"trade_name" text,
	"ruc" text,
	"industry" text NOT NULL,
	"size" "client_size" NOT NULL,
	"city" text NOT NULL,
	"country" text DEFAULT 'Peru' NOT NULL,
	"confidentiality" "client_confidentiality" DEFAULT 'interno' NOT NULL,
	"is_illustrative" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"position" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_illustrative" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" "opportunity_status" DEFAULT 'nuevo_lead' NOT NULL,
	"loss_reason" text,
	"expected_amount" numeric NOT NULL,
	"owner_id" uuid NOT NULL,
	"is_illustrative" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "role" NOT NULL,
	CONSTRAINT "project_members_project_id_user_id_uq" UNIQUE("project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "project_phases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"planned_start" date,
	"planned_end" date,
	"is_illustrative" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"client_id" uuid NOT NULL,
	"opportunity_id" uuid,
	"name" text NOT NULL,
	"status" "project_status" DEFAULT 'activo' NOT NULL,
	"health" "project_health" DEFAULT 'sano' NOT NULL,
	"health_reason" text,
	"owner_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"target_date" date NOT NULL,
	"progress_cached" numeric DEFAULT '0' NOT NULL,
	"archived_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"phase_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" "task_status" DEFAULT 'pendiente' NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"assignee_id" uuid,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"is_illustrative" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"user_id" uuid,
	"contact_id" uuid,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"response" "attendee_response" DEFAULT 'pendiente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"project_id" uuid,
	"type" "meeting_type" NOT NULL,
	"title" text NOT NULL,
	"agenda" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"organizer_id" uuid NOT NULL,
	"is_mock" boolean DEFAULT true NOT NULL,
	"meet_url" text,
	"provider_event_id" text,
	"request_id" text NOT NULL,
	"sync_status" "meeting_sync_status" DEFAULT 'pendiente' NOT NULL,
	"sync_error" text,
	"has_minutes" boolean DEFAULT false NOT NULL,
	"is_illustrative" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meetings_request_id_uq" UNIQUE("request_id")
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_phases" ADD CONSTRAINT "project_phases_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contacts_client_id_idx" ON "contacts" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "opportunities_client_id_idx" ON "opportunities" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "opportunities_status_idx" ON "opportunities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "opportunities_owner_id_idx" ON "opportunities" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "project_members_user_id_idx" ON "project_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_phases_project_id_idx" ON "project_phases" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "projects_client_id_idx" ON "projects" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "projects_opportunity_id_idx" ON "projects" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "projects_owner_id_idx" ON "projects" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_project_id_idx" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tasks_phase_id_idx" ON "tasks" USING btree ("phase_id");--> statement-breakpoint
CREATE INDEX "tasks_assignee_id_idx" ON "tasks" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "meeting_attendees_meeting_id_idx" ON "meeting_attendees" USING btree ("meeting_id");--> statement-breakpoint
CREATE INDEX "meeting_attendees_user_id_idx" ON "meeting_attendees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "meeting_attendees_contact_id_idx" ON "meeting_attendees" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "meetings_client_id_idx" ON "meetings" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "meetings_project_id_idx" ON "meetings" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "meetings_organizer_id_idx" ON "meetings" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "meetings_starts_at_idx" ON "meetings" USING btree ("starts_at");