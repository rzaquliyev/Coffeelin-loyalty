import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getCustomerByPhone,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getAllCustomers,
  createTransaction,
  getCustomerTransactions,
  getAllTransactions,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Customer management
  customer: router({
    // Get customer by phone number (for login)
    getByPhone: publicProcedure
      .input(z.object({ phoneNumber: z.string() }))
      .query(async ({ input }) => {
        return await getCustomerByPhone(input.phoneNumber);
      }),

    // Get customer by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getCustomerById(input.id);
      }),

    // Create new customer
    create: publicProcedure
      .input(
        z.object({
          phoneNumber: z.string(),
          name: z.string(),
          passkitMemberId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createCustomer({
          phoneNumber: input.phoneNumber,
          name: input.name,
          passkitMemberId: input.passkitMemberId,
          bonusBalance: 0,
          tier: "Silver",
        });
        return { success: true };
      }),

    // Update customer
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          bonusBalance: z.number().optional(),
          tier: z.enum(["Silver", "Gold", "Platinum"]).optional(),
          passkitMemberId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateCustomer(id, updates);
        return { success: true };
      }),

    // Get all customers (admin only)
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return await getAllCustomers();
    }),
  }),

  // Transaction management
  transaction: router({
    // Get customer transactions
    getByCustomer: publicProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return await getCustomerTransactions(input.customerId);
      }),

    // Create transaction (add or redeem points)
    create: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
          type: z.enum(["earned", "redeemed"]),
          amount: z.number(),
          spentAmount: z.string().optional(),
          note: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Create transaction
        await createTransaction({
          customerId: input.customerId,
          type: input.type,
          amount: input.amount,
          spentAmount: input.spentAmount,
          performedBy: ctx.user.id,
          note: input.note,
        });

        // Update customer balance
        const customer = await getCustomerById(input.customerId);
        if (customer) {
          const newBalance =
            input.type === "earned"
              ? customer.bonusBalance + input.amount
              : customer.bonusBalance - input.amount;

          // Calculate new tier based on balance
          let newTier: "Silver" | "Gold" | "Platinum" = "Silver";
          if (newBalance >= 200) {
            newTier = "Platinum";
          } else if (newBalance >= 100) {
            newTier = "Gold";
          }

          await updateCustomer(input.customerId, {
            bonusBalance: newBalance,
            tier: newTier,
          });
        }

        return { success: true };
      }),

    // Get all transactions (admin only)
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return await getAllTransactions();
    }),
  }),

  // Loyalty program operations
  loyalty: router({
    // Calculate cashback (5% = 1 bonus per 10 qəpik)
    calculateCashback: publicProcedure
      .input(z.object({ spentAmount: z.number() }))
      .query(({ input }) => {
        const cashbackAzn = input.spentAmount * 0.05; // 5% cashback
        const bonusPoints = Math.floor(cashbackAzn / 0.1); // 1 bonus = 10 qəpik
        return {
          spentAmount: input.spentAmount,
          cashbackAzn: cashbackAzn,
          bonusPoints: bonusPoints,
        };
      }),

    // Get tier info
    getTierInfo: publicProcedure
      .input(z.object({ points: z.number() }))
      .query(({ input }) => {
        let tier: "Silver" | "Gold" | "Platinum" = "Silver";
        let nextTier: string | null = "Gold";
        let pointsToNext = 100 - input.points;

        if (input.points >= 200) {
          tier = "Platinum";
          nextTier = null;
          pointsToNext = 0;
        } else if (input.points >= 100) {
          tier = "Gold";
          nextTier = "Platinum";
          pointsToNext = 200 - input.points;
        }

        return {
          currentTier: tier,
          nextTier,
          pointsToNext,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
