import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, customers, transactions, InsertCustomer, InsertTransaction, Customer, Transaction } from "../drizzle/schema";
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

// Customer management functions
export async function getCustomerByPhone(phoneNumber: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get customer: database not available");
    return undefined;
  }

  const result = await db.select().from(customers).where(eq(customers.phoneNumber, phoneNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get customer: database not available");
    return undefined;
  }

  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCustomer(customer: InsertCustomer): Promise<Customer> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(customers).values(customer);
  const insertId = Number(result[0].insertId);
  const newCustomer = await getCustomerById(insertId);
  if (!newCustomer) throw new Error('Customer yaradıla bilmədi');
  return newCustomer;
}

export async function updateCustomer(id: number, updates: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(customers).set(updates).where(eq(customers.id, id));
}

export async function getAllCustomers() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(customers);
}

// Transaction management functions
export async function createTransaction(transaction: InsertTransaction): Promise<Transaction> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(transactions).values(transaction);
  const insertId = Number(result[0].insertId);
  const newTransaction = await db.select().from(transactions).where(eq(transactions.id, insertId)).limit(1);
  if (!newTransaction[0]) throw new Error('Transaction yaradıla bilmədi');
  return newTransaction[0];
}

export async function getCustomerTransactions(customerId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.customerId, customerId))
    .orderBy(desc(transactions.createdAt));
}

export async function getAllTransactions() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
}

// PassKit integration functions
export async function updateCustomerPassKitId(customerId: number, passkitMemberId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(customers)
    .set({ passkitMemberId, updatedAt: new Date() })
    .where(eq(customers.id, customerId));
}

export async function getCustomerByPassKitId(passkitMemberId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get customer: database not available");
    return null;
  }

  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.passkitMemberId, passkitMemberId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateCustomerBalance(customerId: number, newBalance: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(customers)
    .set({ bonusBalance: newBalance, updatedAt: new Date() })
    .where(eq(customers.id, customerId));
}

export async function updateCustomerTier(customerId: number, newTier: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const tierValue = newTier as "Silver" | "Gold" | "Platinum";
  await db
    .update(customers)
    .set({ tier: tierValue, updatedAt: new Date() })
    .where(eq(customers.id, customerId));
}

// Alias functions for compatibility
export const getTransactionsByCustomerId = getCustomerTransactions;
