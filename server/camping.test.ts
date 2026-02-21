import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getAllCampingSites: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "A-1 텐트 사이트",
      description: "테스트 사이트",
      capacity: 4,
      pricePerNight: "55000.00",
      siteType: "tent",
      imageUrl: null,
      amenities: '["화로대"]',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getCampingSiteById: vi.fn().mockResolvedValue({
    id: 1,
    name: "A-1 텐트 사이트",
    description: "테스트 사이트",
    capacity: 4,
    pricePerNight: "55000.00",
    siteType: "tent",
    imageUrl: null,
    amenities: '["화로대"]',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  createCampingSite: vi.fn().mockResolvedValue(undefined),
  updateCampingSite: vi.fn().mockResolvedValue(undefined),
  deleteCampingSite: vi.fn().mockResolvedValue(undefined),
  createReservation: vi.fn().mockResolvedValue({ insertId: 1 }),
  getReservationById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    siteId: 1,
    checkInDate: Date.now() + 86400000,
    checkOutDate: Date.now() + 172800000,
    guestCount: 2,
    guestName: "홍길동",
    guestPhone: "010-1234-5678",
    guestEmail: "test@example.com",
    specialRequests: null,
    status: "pending",
    totalAmount: "55000.00",
    paymentStatus: "unpaid",
    stripePaymentIntentId: null,
    adminNote: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getReservationsByUserIdWithSites: vi.fn().mockResolvedValue([]),
  getAllReservationsWithSites: vi.fn().mockResolvedValue([]),
  getAllReservations: vi.fn().mockResolvedValue([]),
  updateReservationStatus: vi.fn().mockResolvedValue(undefined),
  checkSiteAvailability: vi.fn().mockResolvedValue(true),
  getReservationsForDateRange: vi.fn().mockResolvedValue([]),
  createInquiry: vi.fn().mockResolvedValue(undefined),
  getAllInquiries: vi.fn().mockResolvedValue([]),
  getInquiryById: vi.fn().mockResolvedValue(null),
  updateInquiryStatus: vi.fn().mockResolvedValue(undefined),
  getAllUsers: vi.fn().mockResolvedValue([]),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock stripe
vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test" }),
        },
      },
    })),
  };
});

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "테스트 사용자",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: { origin: "https://example.com" } } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("sites router", () => {
  it("list returns active camping sites for public users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.sites.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).toHaveProperty("pricePerNight");
  });

  it("get returns a specific site by id", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.sites.get({ id: 1 });
    expect(result).toHaveProperty("id", 1);
    expect(result).toHaveProperty("name", "A-1 텐트 사이트");
  });

  it("create requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext("user"));
    await expect(
      caller.sites.create({
        name: "새 사이트",
        capacity: 4,
        pricePerNight: "50000",
        siteType: "tent",
      })
    ).rejects.toThrow();
  });

  it("admin can create a site", async () => {
    const caller = appRouter.createCaller(createUserContext("admin"));
    const result = await caller.sites.create({
      name: "새 사이트",
      capacity: 4,
      pricePerNight: "50000",
      siteType: "tent",
    });
    expect(result).toEqual({ success: true });
  });
});

describe("reservations router", () => {
  it("checkAvailability returns boolean for public users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.reservations.checkAvailability({
      siteId: 1,
      checkIn: Date.now() + 86400000,
      checkOut: Date.now() + 172800000,
    });
    expect(typeof result).toBe("boolean");
  });

  it("create reservation requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.reservations.create({
        siteId: 1,
        checkInDate: Date.now() + 86400000,
        checkOutDate: Date.now() + 172800000,
        guestCount: 2,
        guestName: "홍길동",
        guestPhone: "010-1234-5678",
        guestEmail: "test@example.com",
        totalAmount: "55000",
      })
    ).rejects.toThrow();
  });

  it("authenticated user can create reservation", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.reservations.create({
      siteId: 1,
      checkInDate: Date.now() + 86400000,
      checkOutDate: Date.now() + 172800000,
      guestCount: 2,
      guestName: "홍길동",
      guestPhone: "010-1234-5678",
      guestEmail: "test@example.com",
      totalAmount: "55000",
    });
    expect(result).toEqual({ success: true });
  });

  it("myList returns user reservations", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.reservations.myList();
    expect(Array.isArray(result)).toBe(true);
  });

  it("adminList requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext("user"));
    await expect(caller.reservations.adminList()).rejects.toThrow();
  });

  it("admin can update reservation status", async () => {
    const caller = appRouter.createCaller(createUserContext("admin"));
    const result = await caller.reservations.updateStatus({ id: 1, status: "approved" });
    expect(result).toEqual({ success: true });
  });
});

describe("inquiries router", () => {
  it("create inquiry is public", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.inquiries.create({
      name: "홍길동",
      email: "test@example.com",
      subject: "예약 문의",
      message: "예약 관련 문의드립니다.",
    });
    expect(result).toEqual({ success: true });
  });

  it("adminList requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext("user"));
    await expect(caller.inquiries.adminList()).rejects.toThrow();
  });

  it("admin can view all inquiries", async () => {
    const caller = appRouter.createCaller(createUserContext("admin"));
    const result = await caller.inquiries.adminList();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("dashboard router", () => {
  it("stats requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext("user"));
    await expect(caller.dashboard.stats()).rejects.toThrow();
  });

  it("admin can view dashboard stats", async () => {
    const caller = appRouter.createCaller(createUserContext("admin"));
    const result = await caller.dashboard.stats();
    expect(result).toHaveProperty("totalReservations");
    expect(result).toHaveProperty("totalSites");
    expect(result).toHaveProperty("totalInquiries");
    expect(result).toHaveProperty("totalRevenue");
  });
});

describe("auth router", () => {
  it("me returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.auth.me();
    expect(result).toHaveProperty("id", 1);
    expect(result).toHaveProperty("role", "user");
  });
});
