import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import {
  createCustomer,
  getCustomerById,
  getCustomerByPhone,
  getAllCustomers,
  updateCustomerPassKitId,
  getCustomerByPassKitId,
  updateCustomerBalance,
  updateCustomerTier,
  createTransaction,
  getTransactionsByCustomerId,
  getAllTransactions,
} from "./db";
import {
  createPassKitMember,
  getPassKitMember,
  updatePassKitMemberPoints,
  updatePassKitMemberTier,
  extractMemberIdFromQR,
  checkPassKitCredentials,
} from "./passkit-api";

/**
 * Tier hesablama funksiyası
 * 0-99 xal: Silver
 * 100-199 xal: Gold
 * 200+ xal: Platinum
 */
function calculateTier(bonusBalance: number): string {
  if (bonusBalance >= 200) return "Platinum";
  if (bonusBalance >= 100) return "Gold";
  return "Silver";
}

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

  /**
   * Müştəri əməliyyatları
   */
  customer: router({
    /**
     * Yeni müştəri yaradır və PassKit-ə sinxronizasiya edir
     */
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Ad daxil edilməlidir"),
          phoneNumber: z.string().min(9, "Telefon nömrəsi düzgün deyil"),
        })
      )
      .mutation(async ({ input }) => {
        // 1. Database-ə müştəri əlavə et
        const customer = await createCustomer({
          name: input.name,
          phoneNumber: input.phoneNumber,
          bonusBalance: 0,
          tier: "Silver",
        });

        // 2. PassKit-ə göndər (əgər credentials varsa)
        if (checkPassKitCredentials()) {
          try {
            const passkitMember = await createPassKitMember({
              externalId: customer.id.toString(),
              displayName: input.name,
              mobileNumber: input.phoneNumber,
              points: 0,
              tierName: "Silver",
            });

            // 3. PassKit Member ID-ni database-də saxla
            await updateCustomerPassKitId(customer.id, passkitMember.id);

            console.log(`[PassKit] Member yaradıldı: ${passkitMember.id} (${input.name})`);
            
            return {
              ...customer,
              passkitMemberId: passkitMember.id,
            };
          } catch (error: any) {
            console.error('[PassKit] Member yaratma xətası:', error.message);
            // Xəta olsa belə, müştəri database-də saxlanılır
          }
        }

        return customer;
      }),

    /**
     * Telefon nömrəsi ilə müştəri axtarışı
     */
    getByPhone: publicProcedure
      .input(z.object({ phoneNumber: z.string() }))
      .query(async ({ input }) => {
        const customer = await getCustomerByPhone(input.phoneNumber);
        
        if (!customer) {
          throw new Error("Müştəri tapılmadı");
        }

        return customer;
      }),

    /**
     * QR kod ilə müştəri axtarışı
     */
    getByQRCode: publicProcedure
      .input(z.object({ qrCode: z.string() }))
      .query(async ({ input }) => {
        if (!checkPassKitCredentials()) {
          throw new Error("PassKit credentials konfiqurasiya edilməyib");
        }

        try {
          // 1. QR koddan Member ID çıxart
          const memberId = extractMemberIdFromQR(input.qrCode);

          // 2. PassKit-dən member məlumatlarını al
          const passkitMember = await getPassKitMember(memberId);

          // 3. Database-dən müştəri tap
          const customer = await getCustomerByPassKitId(passkitMember.id);

          if (!customer) {
            throw new Error("Müştəri database-də tapılmadı");
          }

          return customer;
        } catch (error: any) {
          console.error('[PassKit] QR kod oxuma xətası:', error.message);
          throw new Error(`QR kod oxuna bilmədi: ${error.message}`);
        }
      }),

    /**
     * ID ilə müştəri məlumatlarını alır
     */
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const customer = await getCustomerById(input.id);
        
        if (!customer) {
          throw new Error("Müştəri tapılmadı");
        }

        return customer;
      }),

    /**
     * Bütün müştəriləri siyahısını alır
     */
    list: publicProcedure.query(async () => {
      return await getAllCustomers();
    }),
  }),

  /**
   * Bonus əməliyyatları
   */
  transaction: router({
    /**
     * Yeni bonus əməliyyatı yaradır və PassKit-ə sinxronizasiya edir
     */
    create: publicProcedure
      .input(
        z.object({
          customerId: z.number(),
          amount: z.number().min(1, "Bonus miqdarı 0-dan böyük olmalıdır"),
          spentAmount: z.string().optional(),
          note: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // 1. Müştəri məlumatlarını al
        const customer = await getCustomerById(input.customerId);
        if (!customer) {
          throw new Error("Müştəri tapılmadı");
        }

        // 2. Database-ə əməliyyat əlavə et
        const transaction = await createTransaction({
          customerId: input.customerId,
          amount: input.amount,
          type: "earned",
          note: input.note || `${input.spentAmount || ""} xərcləmə`,
          spentAmount: input.spentAmount,
        });

        // 3. Müştərinin yeni balansını hesabla
        const newBalance = customer.bonusBalance + input.amount;

        // 4. Database-də bonus balansını yenilə
        await updateCustomerBalance(customer.id, newBalance);

        // 5. Tier yoxla və yüksəlt
        const newTier = calculateTier(newBalance);
        let tierChanged = false;

        if (newTier !== customer.tier) {
          await updateCustomerTier(customer.id, newTier);
          tierChanged = true;
          console.log(`[Tier] ${customer.name} tier yüksəldi: ${customer.tier} → ${newTier}`);
        }

        // 6. PassKit-ə sinxronizasiya et
        if (checkPassKitCredentials() && customer.passkitMemberId) {
          try {
            // Bonus balansını yenilə
            await updatePassKitMemberPoints({
              memberId: customer.passkitMemberId,
              points: newBalance,
              transactionType: "earn",
              transactionValue: input.amount,
              transactionDescription: input.note || `${input.spentAmount || ""} xərcləmə`,
            });

            console.log(`[PassKit] Bonus yeniləndi: ${customer.name} - ${newBalance} bonus`);

            // Tier dəyişdisə, PassKit-ə göndər
            if (tierChanged) {
              await updatePassKitMemberTier(customer.passkitMemberId, newTier);
              console.log(`[PassKit] Tier yeniləndi: ${customer.name} - ${newTier}`);
            }
          } catch (error: any) {
            console.error('[PassKit] Sinxronizasiya xətası:', error.message);
            // Xəta olsa belə, əməliyyat database-də saxlanılır
          }
        }

        return {
          transaction,
          newBalance,
          newTier,
          tierChanged,
        };
      }),

    /**
     * Müştərinin bütün əməliyyatlarını alır
     */
    getByCustomerId: publicProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return await getTransactionsByCustomerId(input.customerId);
      }),

    /**
     * Bütün əməliyyatları siyahısını alır
     */
    list: publicProcedure.query(async () => {
      return await getAllTransactions();
    }),
  }),

  /**
   * Cashback hesablama
   */
  cashback: router({
    /**
     * 5% cashback hesablayır (1 bonus = 10 qəpik)
     */
    calculate: publicProcedure
      .input(
        z.object({
          spentAmount: z.number().min(0, "Məbləğ 0-dan böyük olmalıdır"),
        })
      )
      .query(({ input }) => {
        // 5% cashback hesabla
        const cashbackAZN = input.spentAmount * 0.05;
        
        // 1 bonus = 10 qəpik = 0.1 AZN
        // Bonus = Cashback AZN / 0.1
        const bonusPoints = Math.floor(cashbackAZN / 0.1);

        return {
          spentAmount: input.spentAmount,
          cashbackPercentage: 5,
          cashbackAZN,
          bonusPoints,
          formula: "1 bonus = 10 qəpik",
        };
      }),
  }),

  /**
   * Statistika
   */
  stats: router({
    /**
     * Ümumi statistika
     */
    overview: publicProcedure.query(async () => {
      const customers = await getAllCustomers();
      const transactions = await getAllTransactions();

      const totalCustomers = customers.length;
      const totalBonusDistributed = transactions
        .filter(t => t.type === "earned")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const tierDistribution = {
        silver: customers.filter(c => c.tier === "Silver").length,
        gold: customers.filter(c => c.tier === "Gold").length,
        platinum: customers.filter(c => c.tier === "Platinum").length,
      };

      return {
        totalCustomers,
        totalBonusDistributed,
        totalTransactions: transactions.length,
        tierDistribution,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
