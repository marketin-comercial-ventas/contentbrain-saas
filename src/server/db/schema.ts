import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Catálogo global de plataforma (sin tenant_id). Enumerado en
 * docs/DATA_MODEL.md. Existe desde F00 para validar el pipeline de
 * migraciones; no contiene datos de negocio multiempresa.
 */
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AppSetting = typeof appSettings.$inferSelect;
export type NewAppSetting = typeof appSettings.$inferInsert;
