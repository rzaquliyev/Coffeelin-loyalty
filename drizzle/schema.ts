import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Coffee Lin customers table
 * Stores customer loyalty program information
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  /** Telefon nömrəsi (unique identifier) */
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull().unique(),
  /** Müştəri adı */
  name: varchar("name", { length: 255 }).notNull(),
  /** PassKit Member ID (22 characters) */
  passkitMemberId: varchar("passkitMemberId", { length: 64 }),
  /** Bonus balansı (1 bonus = 10 qəpik) */
  bonusBalance: int("bonusBalance").default(0).notNull(),
  /** Tier: Silver, Gold, Platinum */
  tier: mysqlEnum("tier", ["Silver", "Gold", "Platinum"]).default("Silver").notNull(),
  /** Qeydiyyat tarixi */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Son yenilənmə tarixi */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Bonus transactions table
 * Stores all bonus add/use operations
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  /** Müştəri ID */
  customerId: int("customerId").notNull(),
  /** Əməliyyat növü: earned (əlavə edildi), redeemed (istifadə edildi) */
  type: mysqlEnum("type", ["earned", "redeemed"]).notNull(),
  /** Bonus miqdarı */
  amount: int("amount").notNull(),
  /** Xərc məbləği (AZN) - cashback hesablamaq üçün */
  spentAmount: decimal("spentAmount", { precision: 10, scale: 2 }),
  /** Əməliyyatı edən işçi (user ID) */
  performedBy: int("performedBy"),
  /** Qeyd */
  note: text("note"),
  /** Əməliyyat tarixi */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * PassKit configuration table
 * Stores PassKit API credentials and program settings
 */
export const passkitConfig = mysqlTable("passkitConfig", {
  id: int("id").autoincrement().primaryKey(),
  /** PassKit Program ID */
  programId: varchar("programId", { length: 255 }).notNull(),
  /** PassKit Tier ID */
  tierId: varchar("tierId", { length: 255 }),
  /** API credentials path */
  credentialsPath: text("credentialsPath"),
  /** Son sinxronizasiya tarixi */
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PasskitConfig = typeof passkitConfig.$inferSelect;
export type InsertPasskitConfig = typeof passkitConfig.$inferInsert;
