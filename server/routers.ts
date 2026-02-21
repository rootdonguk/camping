import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "./_core/notification";
import {
  getAllCampingSites, getCampingSiteById, createCampingSite, updateCampingSite, deleteCampingSite,
  createReservation, getReservationById, getReservationsByUserIdWithSites, getAllReservationsWithSites, getAllReservations, updateReservationStatus,
  checkSiteAvailability, getReservationsForDateRange,
  createInquiry, getAllInquiries, getInquiryById, updateInquiryStatus,
  getAllUsers, getSiteSetting, getAllSiteSettings, updateSiteSetting, updateReservationPaymentMethod,
  submitBankTransfer, approveBankTransfer, rejectBankTransfer,
  getAllPaymentGatewaySettings, getPaymentGatewaySetting, upsertPaymentGatewaySetting, deletePaymentGatewaySetting,
  getAllBankAccounts, getBankAccountById, createBankAccount, updateBankAccount, deleteBankAccount,
} from "./db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", { apiVersion: "2026-01-28.clover" });

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  sites: router({
    list: publicProcedure.query(async () => getAllCampingSites(true)),
    listAll: adminProcedure.query(async () => getAllCampingSites(false)),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const site = await getCampingSiteById(input.id);
      if (!site) throw new TRPCError({ code: "NOT_FOUND" });
      return site;
    }),
    create: adminProcedure.input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      capacity: z.number().min(1),
      pricePerNight: z.string(),
      imageUrl: z.string().optional(),
      amenities: z.string().optional(),
      siteType: z.enum(["tent", "caravan", "glamping", "cabin"]),
    })).mutation(async ({ input }) => {
      await createCampingSite(input);
      return { success: true };
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      capacity: z.number().min(1).optional(),
      pricePerNight: z.string().optional(),
      imageUrl: z.string().optional(),
      amenities: z.string().optional(),
      siteType: z.enum(["tent", "caravan", "glamping", "cabin"]).optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateCampingSite(id, data);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteCampingSite(input.id);
      return { success: true };
    }),
  }),

  reservations: router({
    checkAvailability: publicProcedure.input(z.object({
      siteId: z.number(),
      checkIn: z.number(),
      checkOut: z.number(),
    })).query(async ({ input }) => {
      return checkSiteAvailability(input.siteId, input.checkIn, input.checkOut);
    }),
    create: protectedProcedure.input(z.object({
      siteId: z.number(),
      checkInDate: z.number(),
      checkOutDate: z.number(),
      guestCount: z.number().min(1),
      guestName: z.string().min(1),
      guestPhone: z.string().min(1),
      guestEmail: z.string().email(),
      specialRequests: z.string().optional(),
      totalAmount: z.string(),
    })).mutation(async ({ ctx, input }) => {
      const available = await checkSiteAvailability(input.siteId, input.checkInDate, input.checkOutDate);
      if (!available) throw new TRPCError({ code: "CONFLICT", message: "Site not available for selected dates" });
      await createReservation({
        userId: ctx.user.id,
        siteId: input.siteId,
        checkInDate: input.checkInDate,
        checkOutDate: input.checkOutDate,
        guestCount: input.guestCount,
        guestName: input.guestName,
        guestPhone: input.guestPhone,
        guestEmail: input.guestEmail,
        specialRequests: input.specialRequests,
        totalAmount: input.totalAmount,
        status: "pending",
        paymentStatus: "unpaid",
      });
      await notifyOwner({
        title: "새로운 예약이 접수되었습니다",
        content: `${input.guestName}님의 예약 (${new Date(input.checkInDate).toLocaleDateString()} ~ ${new Date(input.checkOutDate).toLocaleDateString()})`,
      });
      return { success: true };
    }),
    myList: protectedProcedure.query(async ({ ctx }) => {
      return getReservationsByUserIdWithSites(ctx.user.id);
    }),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const reservation = await getReservationById(input.id);
      if (!reservation) throw new TRPCError({ code: "NOT_FOUND" });
      if (reservation.userId !== ctx.user.id && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return reservation;
    }),
    cancel: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const reservation = await getReservationById(input.id);
      if (!reservation) throw new TRPCError({ code: "NOT_FOUND" });
      if (reservation.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (reservation.status === "cancelled") throw new TRPCError({ code: "BAD_REQUEST", message: "Already cancelled" });
      await updateReservationStatus(input.id, "cancelled");
      return { success: true };
    }),
    adminList: adminProcedure.query(async () => {
      return getAllReservationsWithSites();
    }),
    updateStatus: adminProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["pending", "approved", "rejected", "cancelled"]),
    })).mutation(async ({ input }) => {
      await updateReservationStatus(input.id, input.status);
      return { success: true };
    }),
  }),

  inquiries: router({
    create: publicProcedure.input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      subject: z.string().min(1),
      message: z.string().min(1),
    })).mutation(async ({ input }) => {
      await createInquiry(input);
      await notifyOwner({
        title: "새로운 문의가 접수되었습니다",
        content: `${input.name}님의 문의: ${input.subject}`,
      });
      return { success: true };
    }),
    adminList: adminProcedure.query(async () => {
      return getAllInquiries();
    }),
    get: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return getInquiryById(input.id);
    }),
    updateStatus: adminProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["unread", "read", "replied"]),
      adminReply: z.string().optional(),
    })).mutation(async ({ input }) => {
      await updateInquiryStatus(input.id, input.status, input.adminReply);
      return { success: true };
    }),
    reply: adminProcedure.input(z.object({
      id: z.number(),
      adminReply: z.string().min(1),
    })).mutation(async ({ input }) => {
      await updateInquiryStatus(input.id, "replied", input.adminReply);
      return { success: true };
    }),
  }),

  dashboard: router({
    stats: adminProcedure.query(async () => {
      const allReservations = await getAllReservations();
      const pending = allReservations.filter(r => r.status === "pending").length;
      const approved = allReservations.filter(r => r.status === "approved").length;
      const allSites = await getAllCampingSites(false);
      const allInquiries = await getAllInquiries();
      const unreadInquiries = allInquiries.filter(i => i.status === "unread").length;
      const allUsers = await getAllUsers();
      const totalRevenue = allReservations
        .filter(r => r.paymentStatus === "fully_paid")
        .reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);
      return {
        totalReservations: allReservations.length,
        pendingReservations: pending,
        approvedReservations: approved,
        totalSites: allSites.length,
        activeSites: allSites.filter(s => s.isActive).length,
        totalInquiries: allInquiries.length,
        unreadInquiries,
        totalUsers: allUsers.length,
        totalRevenue,
        recentReservations: allReservations.slice(0, 5),
        recentInquiries: allInquiries.slice(0, 5),
      };
    }),
  }),

  payments: router({
    createCheckout: protectedProcedure.input(z.object({
      reservationId: z.number(),
      paymentType: z.enum(["deposit", "full"]),
    })).mutation(async ({ ctx, input }) => {
      const reservation = await getReservationById(input.reservationId);
      if (!reservation) throw new TRPCError({ code: "NOT_FOUND" });
      if (reservation.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      const totalAmount = parseFloat(reservation.totalAmount);
      const amount = input.paymentType === "deposit" ? Math.round(totalAmount * 0.3 * 100) : Math.round(totalAmount * 100);
      const origin = (ctx.req.headers.origin as string) || "http://localhost:3000";
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "krw",
            product_data: {
              name: input.paymentType === "deposit" ? `예약 보증금 (예약 #${reservation.id})` : `예약 전액 결제 (예약 #${reservation.id})`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${origin}/reservations?payment=success`,
        cancel_url: `${origin}/reservations?payment=cancelled`,
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          reservation_id: reservation.id.toString(),
          payment_type: input.paymentType,
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "",
        },
        allow_promotion_codes: true,
      });
      return { url: session.url };
    }),
  }),

  paymentMethods: router({
    createCheckoutWithMethod: protectedProcedure.input(z.object({
      reservationId: z.number(),
      paymentType: z.enum(["deposit", "full"]),
      paymentMethod: z.enum(["stripe", "naver_pay", "kakao_pay", "toss", "bank_transfer"]).default("stripe"),
    })).mutation(async ({ ctx, input }) => {
      const reservation = await getReservationById(input.reservationId);
      if (!reservation) throw new TRPCError({ code: "NOT_FOUND" });
      if (reservation.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      const totalAmount = parseFloat(reservation.totalAmount);
      const amount = input.paymentType === "deposit" ? Math.round(totalAmount * 0.3 * 100) : Math.round(totalAmount * 100);
      const origin = (ctx.req.headers.origin as string) || "http://localhost:3000";
      
      if (input.paymentMethod === "stripe") {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [{
            price_data: {
              currency: "krw",
              product_data: {
                name: input.paymentType === "deposit" ? `예약 보증금 (예약 #${reservation.id})` : `예약 전액 결제 (예약 #${reservation.id})`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          }],
          mode: "payment",
          success_url: `${origin}/reservations?payment=success`,
          cancel_url: `${origin}/reservations?payment=cancelled`,
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            reservation_id: reservation.id.toString(),
            payment_type: input.paymentType,
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
          },
          allow_promotion_codes: true,
        });
        return { url: session.url, method: "stripe" };
      } else if (input.paymentMethod === "naver_pay") {
        return { url: `${origin}/payment/naver?reservationId=${reservation.id}&amount=${amount}&type=${input.paymentType}`, method: "naver_pay" };
      } else if (input.paymentMethod === "kakao_pay") {
        return { url: `${origin}/payment/kakao?reservationId=${reservation.id}&amount=${amount}&type=${input.paymentType}`, method: "kakao_pay" };
      } else if (input.paymentMethod === "toss") {
        return { url: `${origin}/payment/toss?reservationId=${reservation.id}&amount=${amount}&type=${input.paymentType}`, method: "toss" };
      } else if (input.paymentMethod === "bank_transfer") {
        // 계좌이체 정보 반환
        const bankInfo = await getSiteSetting("bank_account_info");
        return { 
          method: "bank_transfer",
          bankInfo: bankInfo?.value || "은행: 국민은행\n계좌번호: 123-456-789012\n예금주: 캠핑장",
          amount: amount / 100,
          reservationId: reservation.id,
        };
      }
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid payment method" });
    }),
    updatePaymentMethod: adminProcedure.input(z.object({
      reservationId: z.number(),
      paymentMethod: z.enum(["stripe", "naver_pay", "kakao_pay", "toss", "bank_transfer"]),
      paymentId: z.string(),
    })).mutation(async ({ input }) => {
      await updateReservationPaymentMethod(input.reservationId, input.paymentMethod, input.paymentId);
      return { success: true };
    }),
    submitBankTransfer: protectedProcedure.input(z.object({
      reservationId: z.number(),
      amount: z.string(),
      proofUrl: z.string(),
    })).mutation(async ({ ctx, input }) => {
      const reservation = await getReservationById(input.reservationId);
      if (!reservation) throw new TRPCError({ code: "NOT_FOUND" });
      if (reservation.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      await submitBankTransfer(input.reservationId, input.amount, input.proofUrl);
      await notifyOwner({
        title: "계좌이체 확인 요청",
        content: `예약 #${input.reservationId} - ${ctx.user.name}님이 계좌이체를 완료했습니다. 금액: ${input.amount}원`,
      });
      return { success: true };
    }),
    approveBankTransfer: adminProcedure.input(z.object({
      reservationId: z.number(),
      paymentStatus: z.enum(["deposit_paid", "fully_paid"]),
    })).mutation(async ({ ctx, input }) => {
      await approveBankTransfer(input.reservationId, input.paymentStatus, ctx.user.id);
      return { success: true };
    }),
    rejectBankTransfer: adminProcedure.input(z.object({
      reservationId: z.number(),
      adminNote: z.string(),
    })).mutation(async ({ input }) => {
      await rejectBankTransfer(input.reservationId, input.adminNote);
      return { success: true };
    }),
  }),

  settings: router({
    get: publicProcedure.input(z.object({ key: z.string() })).query(async ({ input }) => {
      return getSiteSetting(input.key);
    }),
    getAll: publicProcedure.query(async () => {
      return getAllSiteSettings();
    }),
    update: adminProcedure.input(z.object({
      key: z.string().min(1),
      value: z.string(),
    })).mutation(async ({ input }) => {
      await updateSiteSetting(input.key, input.value);
      return { success: true };
    }),
  }),

  paymentGateways: router({
    list: adminProcedure.query(async () => {
      return getAllPaymentGatewaySettings();
    }),
    get: adminProcedure.input(z.object({
      provider: z.enum(["stripe", "naver_pay", "kakao_pay", "toss"]),
    })).query(async ({ input }) => {
      return getPaymentGatewaySetting(input.provider);
    }),
    upsert: adminProcedure.input(z.object({
      provider: z.enum(["stripe", "naver_pay", "kakao_pay", "toss"]),
      isEnabled: z.boolean(),
      apiKey: z.string().optional(),
      apiSecret: z.string().optional(),
      merchantId: z.string().optional(),
      webhookUrl: z.string().optional(),
      testMode: z.boolean(),
      config: z.string().optional(),
    })).mutation(async ({ input }) => {
      await upsertPaymentGatewaySetting(input);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({
      provider: z.enum(["stripe", "naver_pay", "kakao_pay", "toss"]),
    })).mutation(async ({ input }) => {
      await deletePaymentGatewaySetting(input.provider);
      return { success: true };
    }),
  }),

  bankAccounts: router({
    list: publicProcedure.query(async () => {
      return getAllBankAccounts(true);
    }),
    listAll: adminProcedure.query(async () => {
      return getAllBankAccounts(false);
    }),
    get: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return getBankAccountById(input.id);
    }),
    create: adminProcedure.input(z.object({
      bankName: z.string().min(1),
      accountNumber: z.string().min(1),
      accountHolder: z.string().min(1),
      displayOrder: z.number().default(0),
    })).mutation(async ({ input }) => {
      await createBankAccount(input);
      return { success: true };
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      bankName: z.string().min(1).optional(),
      accountNumber: z.string().min(1).optional(),
      accountHolder: z.string().min(1).optional(),
      isActive: z.boolean().optional(),
      displayOrder: z.number().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateBankAccount(id, data);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteBankAccount(input.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
