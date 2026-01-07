/**
 * Test Müştəriləri Yaratma Skripti
 * 
 * Bu skript verilənlər bazına test müştəriləri və əməliyyatlar əlavə edir.
 * 
 * İstifadə:
 * node scripts/seed-test-data.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { customers, transactions } from "../drizzle/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

console.log("🔄 Connecting to database...");

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log("✅ Connected to database");

// Test müştəriləri
const testCustomers = [
  {
    name: "Əli Məmmədov",
    phoneNumber: "+994501234567",
    bonusBalance: 150,
    tier: "gold",
    passkitMemberId: null,
  },
  {
    name: "Leyla Həsənova",
    phoneNumber: "+994552345678",
    bonusBalance: 250,
    tier: "platinum",
    passkitMemberId: null,
  },
  {
    name: "Rəşad Quliyev",
    phoneNumber: "+994703456789",
    bonusBalance: 50,
    tier: "silver",
    passkitMemberId: null,
  },
  {
    name: "Nigar Əliyeva",
    phoneNumber: "+994514567890",
    bonusBalance: 0,
    tier: "silver",
    passkitMemberId: null,
  },
  {
    name: "Elvin Cəfərov",
    phoneNumber: "+994555678901",
    bonusBalance: 180,
    tier: "gold",
    passkitMemberId: null,
  },
];

console.log("🔄 Creating test customers...");

const createdCustomers = [];

for (const customer of testCustomers) {
  try {
    const result = await db.insert(customers).values(customer);
    const customerId = Number(result[0].insertId);
    createdCustomers.push({ ...customer, id: customerId });
    console.log(`✅ Created customer: ${customer.name} (ID: ${customerId})`);
  } catch (error) {
    console.error(`❌ Failed to create customer ${customer.name}:`, error.message);
  }
}

console.log(`\n✅ Created ${createdCustomers.length} test customers`);

// Test əməliyyatları
console.log("\n🔄 Creating test transactions...");

const testTransactions = [
  // Əli Məmmədov üçün
  {
    customerId: createdCustomers[0]?.id,
    amount: 50,
    type: "earned",
    spentAmount: "100 AZN",
    note: "Xərcləmə: 100 AZN (5% cashback)",
  },
  {
    customerId: createdCustomers[0]?.id,
    amount: 100,
    type: "earned",
    spentAmount: "200 AZN",
    note: "Xərcləmə: 200 AZN (5% cashback)",
  },
  // Leyla Həsənova üçün
  {
    customerId: createdCustomers[1]?.id,
    amount: 150,
    type: "earned",
    spentAmount: "300 AZN",
    note: "Xərcləmə: 300 AZN (5% cashback)",
  },
  {
    customerId: createdCustomers[1]?.id,
    amount: 100,
    type: "earned",
    spentAmount: "200 AZN",
    note: "Xərcləmə: 200 AZN (5% cashback)",
  },
  // Rəşad Quliyev üçün
  {
    customerId: createdCustomers[2]?.id,
    amount: 50,
    type: "earned",
    spentAmount: "100 AZN",
    note: "Xərcləmə: 100 AZN (5% cashback)",
  },
  // Elvin Cəfərov üçün
  {
    customerId: createdCustomers[4]?.id,
    amount: 80,
    type: "earned",
    spentAmount: "160 AZN",
    note: "Xərcləmə: 160 AZN (5% cashback)",
  },
  {
    customerId: createdCustomers[4]?.id,
    amount: 100,
    type: "earned",
    spentAmount: "200 AZN",
    note: "Xərcləmə: 200 AZN (5% cashback)",
  },
];

let transactionCount = 0;

for (const transaction of testTransactions) {
  if (!transaction.customerId) continue;
  
  try {
    await db.insert(transactions).values(transaction);
    transactionCount++;
    console.log(`✅ Created transaction for customer ID ${transaction.customerId}`);
  } catch (error) {
    console.error(`❌ Failed to create transaction:`, error.message);
  }
}

console.log(`\n✅ Created ${transactionCount} test transactions`);

// Statistika
console.log("\n📊 Test Data Summary:");
console.log(`   Müştərilər: ${createdCustomers.length}`);
console.log(`   Əməliyyatlar: ${transactionCount}`);
console.log(`   Tier dağılımı:`);
console.log(`     - Silver: ${createdCustomers.filter(c => c.tier === "silver").length}`);
console.log(`     - Gold: ${createdCustomers.filter(c => c.tier === "gold").length}`);
console.log(`     - Platinum: ${createdCustomers.filter(c => c.tier === "platinum").length}`);

await connection.end();

console.log("\n✅ Test data seeding completed!");
console.log("\n📝 Test müştəriləri:");
createdCustomers.forEach(c => {
  console.log(`   ${c.name} - ${c.phoneNumber} - ${c.bonusBalance} bonus (${c.tier})`);
});

console.log("\n🎉 Hazırsınız! İndi https://coffeelinloyalty-bonus.manus.space/admin səhifəsində test edə bilərsiniz.");
