import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  date,
  real,
  json,
} from "drizzle-orm/pg-core";

// ==============================
// Better Auth Core Tables
// ==============================
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

// ==============================
// CV-Mega Custom Tables
// ==============================

export const profile = pgTable("profile", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  username: text("username").notNull().unique(),
  headline: text("headline"),
  bio: text("bio"),
  photoUrl: text("photoUrl"),
  location: text("location"),
  phone: text("phone"),
  isPublic: boolean("isPublic").default(false),
  themePrimaryColor: text("themePrimaryColor").default("0 84.2% 60.2%"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const experience = pgTable("experience", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  role: text("role").notNull(),
  description: text("description"),
  startDate: date("startDate").notNull(),
  endDate: date("endDate"), 
  isCurrent: boolean("isCurrent").default(false),
  sortOrder: integer("sortOrder").default(0),
});

export const education = pgTable("education", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  field: text("field").notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  gpa: real("gpa"),
  sortOrder: integer("sortOrder").default(0),
});

export const skill = pgTable("skill", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  proficiency: text("proficiency").notNull(),
  category: text("category").notNull(), // 'BASIC', 'ADDITIONAL', 'AI'
  sortOrder: integer("sortOrder").default(0),
});

export const portfolio = pgTable("portfolio", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url"),
  repoUrl: text("repoUrl"),
  imageUrl: text("imageUrl"),
  techStack: json("techStack"), // array of strings
  sortOrder: integer("sortOrder").default(0),
});

export const certificate = pgTable("certificate", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  issuer: text("issuer").notNull(),
  issueDate: date("issueDate").notNull(),
  fileUrl: text("fileUrl"), // PDF/Image from Firebase
  credentialUrl: text("credentialUrl"),
  sortOrder: integer("sortOrder").default(0),
});

export const paklaring = pgTable("paklaring", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  companyName: text("companyName").notNull(),
  documentUrl: text("documentUrl").notNull(), // Firebase PDF/Image URL
  issueDate: date("issueDate"),
  sortOrder: integer("sortOrder").default(0),
});
