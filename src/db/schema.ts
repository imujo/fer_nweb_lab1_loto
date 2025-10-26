import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  timestamp,
  uuid,
  text,
} from "drizzle-orm/pg-core";

export const rounds = pgTable("rounds", {
  id: serial("id").primaryKey(),
  roundNumber: integer("round_number").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
});

export const tickets = pgTable("tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  roundId: integer("round_id")
    .references(() => rounds.id)
    .notNull(),
  personalId: varchar("personal_id", { length: 20 }).notNull(),
  numbers: text("numbers").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const draws = pgTable("draws", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id")
    .references(() => rounds.id)
    .notNull(),
  numbers: text("numbers").notNull(),
  drawnAt: timestamp("drawn_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});
