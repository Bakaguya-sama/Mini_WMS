import "dotenv/config";
import { PrismaClient } from "../generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcrypt";

// Reuse the same Neon adapter setup as db.config.ts
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Warehouse ────────────────────────────────────────────────────────────
  // MANAGER and STAFF require a warehouseId, so we seed one first.
  const warehouse = await prisma.warehouse.upsert({
    where: { name: "Main Warehouse" },
    update: {},
    create: { name: "Main Warehouse" },
  });

  console.log(`✅ Warehouse: ${warehouse.name} (${warehouse.id})`);

  // ─── Users ────────────────────────────────────────────────────────────────
  const SALT_ROUNDS = 10;

  const users = [
    {
      email: "admin@miniwms.com",
      username: "admin",
      password: await bcrypt.hash("admin123", SALT_ROUNDS),
      role: "ADMIN" as const,
      warehouseId: null,
    },
    {
      email: "manager@miniwms.com",
      username: "manager",
      password: await bcrypt.hash("manager123", SALT_ROUNDS),
      role: "MANAGER" as const,
      warehouseId: warehouse.id,
    },
    {
      email: "staff@miniwms.com",
      username: "staff",
      password: await bcrypt.hash("staff123", SALT_ROUNDS),
      role: "STAFF" as const,
      warehouseId: warehouse.id,
    },
  ];

  for (const user of users) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });

    console.log(`✅ User [${created.role}]: ${created.email}`);
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log("──────────────────────────────────────");
  console.log("  admin@miniwms.com   / admin123");
  console.log("  manager@miniwms.com / manager123");
  console.log("  staff@miniwms.com   / staff123");
  console.log("──────────────────────────────────────");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
