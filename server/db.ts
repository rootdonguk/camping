import { eq, desc, and, or, lte, gte, ne, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, campingSites, reservations, inquiries, siteSettings, paymentGatewaySettings, bankAccounts, InsertCampingSite, InsertReservation, InsertInquiry, InsertSiteSetting, InsertPaymentGatewaySetting, InsertBankAccount } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getAllCampingSites(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return db.select().from(campingSites).where(eq(campingSites.isActive, true)).orderBy(campingSites.name);
  }
  return db.select().from(campingSites).orderBy(campingSites.name);
}

export async function getCampingSiteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(campingSites).where(eq(campingSites.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCampingSite(data: InsertCampingSite) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(campingSites).values(data);
}

export async function updateCampingSite(id: number, data: Partial<InsertCampingSite>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(campingSites).set(data).where(eq(campingSites.id, id));
}

export async function deleteCampingSite(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(campingSites).set({ isActive: false }).where(eq(campingSites.id, id));
}

export async function createReservation(data: InsertReservation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(reservations).values(data);
  return result;
}

export async function getReservationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getReservationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reservations).where(eq(reservations.userId, userId)).orderBy(desc(reservations.createdAt));
}

export async function getReservationsByUserIdWithSites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(reservations).where(eq(reservations.userId, userId)).orderBy(desc(reservations.createdAt));
  const siteIdSet = new Set(rows.map(r => r.siteId));
  const siteIds = Array.from(siteIdSet);
  const siteRows = siteIds.length > 0 ? await db.select().from(campingSites).where(inArray(campingSites.id, siteIds)) : [];
  const siteMap = Object.fromEntries(siteRows.map(s => [s.id, s]));
  return rows.map(r => ({ ...r, site: siteMap[r.siteId] || null }));
}

export async function getAllReservationsWithSites() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(reservations).orderBy(desc(reservations.createdAt));
  const siteIdSet2 = new Set(rows.map(r => r.siteId));
  const siteIds = Array.from(siteIdSet2);
  const siteRows = siteIds.length > 0 ? await db.select().from(campingSites).where(inArray(campingSites.id, siteIds)) : [];
  const siteMap = Object.fromEntries(siteRows.map(s => [s.id, s]));
  return rows.map(r => ({ ...r, site: siteMap[r.siteId] || null }));
}

export async function getAllReservations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reservations).orderBy(desc(reservations.createdAt));
}

export async function updateReservationStatus(id: number, status: "pending" | "approved" | "rejected" | "cancelled", adminNote?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (adminNote !== undefined) updateData.adminNote = adminNote;
  await db.update(reservations).set(updateData).where(eq(reservations.id, id));
}

export async function updateReservationPayment(id: number, paymentStatus: "unpaid" | "deposit_paid" | "fully_paid", stripePaymentIntentId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { paymentStatus };
  if (stripePaymentIntentId) updateData.stripePaymentIntentId = stripePaymentIntentId;
  await db.update(reservations).set(updateData).where(eq(reservations.id, id));
}

export async function checkSiteAvailability(siteId: number, checkIn: number, checkOut: number, excludeReservationId?: number) {
  const db = await getDb();
  if (!db) return true;
  const baseConditions = [
    eq(reservations.siteId, siteId),
    or(
      and(lte(reservations.checkInDate, checkIn), gte(reservations.checkOutDate, checkIn)),
      and(lte(reservations.checkInDate, checkOut), gte(reservations.checkOutDate, checkOut)),
      and(gte(reservations.checkInDate, checkIn), lte(reservations.checkOutDate, checkOut))
    ),
    or(eq(reservations.status, "pending"), eq(reservations.status, "approved")),
  ];
  const allConditions = excludeReservationId
    ? [...baseConditions, ne(reservations.id, excludeReservationId)]
    : baseConditions;
  const conflicts = await db.select().from(reservations).where(and(...allConditions));
  return conflicts.length === 0;
}

export async function getReservationsForDateRange(checkIn: number, checkOut: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reservations).where(
    and(
      or(
        and(lte(reservations.checkInDate, checkIn), gte(reservations.checkOutDate, checkIn)),
        and(lte(reservations.checkInDate, checkOut), gte(reservations.checkOutDate, checkOut)),
        and(gte(reservations.checkInDate, checkIn), lte(reservations.checkOutDate, checkOut))
      ),
      or(eq(reservations.status, "pending"), eq(reservations.status, "approved"))
    )
  );
}

export async function createInquiry(data: InsertInquiry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(inquiries).values(data);
}

export async function getAllInquiries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
}

export async function getInquiryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(inquiries).where(eq(inquiries.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateInquiryStatus(id: number, status: "unread" | "read" | "replied", adminReply?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (adminReply !== undefined) updateData.adminReply = adminReply;
  await db.update(inquiries).set(updateData).where(eq(inquiries.id, id));
}

export async function getUnreadInquiryCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(inquiries).where(eq(inquiries.status, "unread"));
  return result.length;
}

export async function getPendingReservationCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(reservations).where(eq(reservations.status, "pending"));
  return result.length;
}


// Site settings helpers
export async function getSiteSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllSiteSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteSettings);
}

export async function updateSiteSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSiteSetting(key);
  if (existing) {
    await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key));
  } else {
    await db.insert(siteSettings).values({ key, value });
  }
}

export async function updateReservationPaymentMethod(id: number, paymentMethod: "stripe" | "naver_pay" | "kakao_pay" | "toss" | "bank_transfer", paymentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { paymentMethod };
  if (paymentMethod === "naver_pay") updateData.naverpayOrderId = paymentId;
  else if (paymentMethod === "kakao_pay") updateData.kakaopayTid = paymentId;
  else if (paymentMethod === "toss") updateData.tossOrderId = paymentId;
  await db.update(reservations).set(updateData).where(eq(reservations.id, id));
}

export async function submitBankTransfer(id: number, amount: string, proofUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reservations).set({
    paymentMethod: "bank_transfer",
    bankTransferAmount: amount,
    bankTransferProof: proofUrl,
    bankTransferDate: new Date(),
    paymentStatus: "pending_verification",
  }).where(eq(reservations.id, id));
}

export async function approveBankTransfer(id: number, paymentStatus: "deposit_paid" | "fully_paid", adminId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reservations).set({
    paymentStatus,
    status: "approved",
    bankTransferApprovedBy: adminId,
    bankTransferApprovedAt: new Date(),
  }).where(eq(reservations.id, id));
}

export async function rejectBankTransfer(id: number, adminNote: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reservations).set({
    paymentStatus: "unpaid",
    adminNote,
  }).where(eq(reservations.id, id));
}

// Payment Gateway Settings
export async function getAllPaymentGatewaySettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentGatewaySettings);
}

export async function getPaymentGatewaySetting(provider: "stripe" | "naver_pay" | "kakao_pay" | "toss") {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(paymentGatewaySettings).where(eq(paymentGatewaySettings.provider, provider)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertPaymentGatewaySetting(data: InsertPaymentGatewaySetting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getPaymentGatewaySetting(data.provider);
  if (existing) {
    await db.update(paymentGatewaySettings).set(data).where(eq(paymentGatewaySettings.provider, data.provider));
  } else {
    await db.insert(paymentGatewaySettings).values(data);
  }
}

export async function deletePaymentGatewaySetting(provider: "stripe" | "naver_pay" | "kakao_pay" | "toss") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(paymentGatewaySettings).where(eq(paymentGatewaySettings.provider, provider));
}

// Bank Accounts
export async function getAllBankAccounts(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return db.select().from(bankAccounts).where(eq(bankAccounts.isActive, true)).orderBy(bankAccounts.displayOrder);
  }
  return db.select().from(bankAccounts).orderBy(bankAccounts.displayOrder);
}

export async function getBankAccountById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBankAccount(data: InsertBankAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(bankAccounts).values(data);
}

export async function updateBankAccount(id: number, data: Partial<InsertBankAccount>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bankAccounts).set(data).where(eq(bankAccounts.id, id));
}

export async function deleteBankAccount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(bankAccounts).where(eq(bankAccounts.id, id));
}
