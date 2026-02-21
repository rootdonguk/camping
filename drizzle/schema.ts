import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

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

// Camping sites table
export const campingSites = mysqlTable("camping_sites", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  capacity: int("capacity").notNull().default(4),
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  amenities: text("amenities"), // JSON string array
  siteType: mysqlEnum("site_type", ["tent", "caravan", "glamping", "cabin"]).default("tent").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CampingSite = typeof campingSites.$inferSelect;
export type InsertCampingSite = typeof campingSites.$inferInsert;

// Reservations table
export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  siteId: int("site_id").notNull(),
  checkInDate: bigint("check_in_date", { mode: "number" }).notNull(), // UTC timestamp ms
  checkOutDate: bigint("check_out_date", { mode: "number" }).notNull(), // UTC timestamp ms
  guestCount: int("guest_count").notNull().default(1),
  guestName: varchar("guest_name", { length: 128 }).notNull(),
  guestPhone: varchar("guest_phone", { length: 32 }).notNull(),
  guestEmail: varchar("guest_email", { length: 320 }).notNull(),
  specialRequests: text("special_requests"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled"]).default("pending").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: mysqlEnum("payment_status", ["unpaid", "deposit_paid", "fully_paid", "pending_verification"]).default("unpaid").notNull(),
  paymentMethod: mysqlEnum("payment_method", ["stripe", "naver_pay", "kakao_pay", "toss", "bank_transfer"]).default("stripe"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 256 }),
  naverpayOrderId: varchar("naverpay_order_id", { length: 256 }),
  kakaopayTid: varchar("kakaopay_tid", { length: 256 }),
  tossOrderId: varchar("toss_order_id", { length: 256 }),
  bankTransferProof: text("bank_transfer_proof"), // 계좌이체 증빙 이미지 URL
  bankTransferAmount: decimal("bank_transfer_amount", { precision: 10, scale: 2 }),
  bankTransferDate: timestamp("bank_transfer_date"),
  bankTransferApprovedBy: int("bank_transfer_approved_by"), // 승인한 관리자 ID
  bankTransferApprovedAt: timestamp("bank_transfer_approved_at"),
  adminNote: text("admin_note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;

// Inquiries table
export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  subject: varchar("subject", { length: 256 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["unread", "read", "replied"]).default("unread").notNull(),
  adminReply: text("admin_reply"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

// Site content settings table (for managing homepage text, images, etc)
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

// Payment gateway settings table
export const paymentGatewaySettings = mysqlTable("payment_gateway_settings", {
  id: int("id").autoincrement().primaryKey(),
  provider: mysqlEnum("provider", ["stripe", "naver_pay", "kakao_pay", "toss"]).notNull().unique(),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  apiKey: text("api_key"), // 암호화 필요
  apiSecret: text("api_secret"), // 암호화 필요
  merchantId: varchar("merchant_id", { length: 256 }),
  webhookUrl: text("webhook_url"),
  testMode: boolean("test_mode").default(true).notNull(),
  config: text("config"), // JSON string for additional settings
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentGatewaySetting = typeof paymentGatewaySettings.$inferSelect;
export type InsertPaymentGatewaySetting = typeof paymentGatewaySettings.$inferInsert;

// Bank account settings for bank transfer
export const bankAccounts = mysqlTable("bank_accounts", {
  id: int("id").autoincrement().primaryKey(),
  bankName: varchar("bank_name", { length: 128 }).notNull(),
  accountNumber: varchar("account_number", { length: 128 }).notNull(),
  accountHolder: varchar("account_holder", { length: 128 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: int("display_order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;
