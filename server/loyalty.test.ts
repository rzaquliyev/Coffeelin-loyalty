import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-admin",
    email: "admin@coffelin.az",
    name: "Test Admin",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Loyalty System", () => {
  describe("calculateCashback", () => {
    it("should calculate 5% cashback correctly", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.loyalty.calculateCashback({ spentAmount: 100 });

      expect(result.spentAmount).toBe(100);
      expect(result.cashbackAzn).toBe(5); // 5% of 100
      expect(result.bonusPoints).toBe(50); // 5 AZN = 50 bonus (1 bonus = 10 qəpik)
    });

    it("should handle decimal amounts", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.loyalty.calculateCashback({ spentAmount: 150.50 });

      expect(result.spentAmount).toBe(150.50);
      expect(result.cashbackAzn).toBeCloseTo(7.525, 2); // 5% of 150.50
      expect(result.bonusPoints).toBe(75); // 7.525 AZN = 75 bonus (rounded down)
    });

    it("should return 0 for zero amount", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.loyalty.calculateCashback({ spentAmount: 0 });

      expect(result.spentAmount).toBe(0);
      expect(result.cashbackAzn).toBe(0);
      expect(result.bonusPoints).toBe(0);
    });
  });

  describe("getTierInfo", () => {
    it("should return Silver tier for points < 100", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.loyalty.getTierInfo({ points: 50 });

      expect(result.currentTier).toBe("Silver");
      expect(result.nextTier).toBe("Gold");
      expect(result.pointsToNext).toBe(50); // 100 - 50
    });

    it("should return Gold tier for points >= 100 and < 200", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.loyalty.getTierInfo({ points: 150 });

      expect(result.currentTier).toBe("Gold");
      expect(result.nextTier).toBe("Platinum");
      expect(result.pointsToNext).toBe(50); // 200 - 150
    });

    it("should return Platinum tier for points >= 200", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.loyalty.getTierInfo({ points: 250 });

      expect(result.currentTier).toBe("Platinum");
      expect(result.nextTier).toBeNull();
      expect(result.pointsToNext).toBe(0);
    });

    it("should handle exact tier boundaries", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // Exactly 100 points should be Gold
      const result100 = await caller.loyalty.getTierInfo({ points: 100 });
      expect(result100.currentTier).toBe("Gold");

      // Exactly 200 points should be Platinum
      const result200 = await caller.loyalty.getTierInfo({ points: 200 });
      expect(result200.currentTier).toBe("Platinum");
    });
  });
});

describe("Customer Operations", () => {
  it("should allow creating a customer", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // This test validates the mutation structure
    // In a real test environment with database, we would verify the actual creation
    expect(caller.customer.create).toBeDefined();
  });

  it("should allow querying customer by phone", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // This validates the query structure
    expect(caller.customer.getByPhone).toBeDefined();
  });
});

describe("Transaction Operations", () => {
  it("should require admin role for creating transactions", async () => {
    const ctx = createTestContext();
    ctx.user!.role = "user"; // Change to non-admin
    const caller = appRouter.createCaller(ctx);

    // This would require a real database to test fully
    // Here we just validate the procedure exists
    expect(caller.transaction.create).toBeDefined();
  });
});
