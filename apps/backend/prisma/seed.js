"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = require("../generated/prisma");
const adapter_neon_1 = require("@prisma/adapter-neon");
const bcrypt_1 = __importDefault(require("bcrypt"));
const shared_types_1 = require("@mini-wms/shared-types");
const env_config_1 = require("@/config/env.config");
// Reuse the same Neon adapter setup as db.config.ts
const adapter = new adapter_neon_1.PrismaNeon({
    connectionString: env_config_1.env.DATABASE_URL,
});
const prisma = new prisma_1.PrismaClient({ adapter });
async function main() {
    console.log("🌱 Seeding database...");
    console.log("🧹 Cleaning up existing data...");
    await prisma.package.deleteMany();
    await prisma.user.deleteMany();
    await prisma.warehouse.deleteMany();
    console.log("✅ Cleanup complete.\n");
    const SALT_ROUNDS = 10;
    const defaultPassword = await bcrypt_1.default.hash("password123", SALT_ROUNDS);
    // ─── 1. Admin ─────────────────────────────────────────────────────────────
    const admin = await prisma.user.upsert({
        where: { email: "admin@miniwms.com" },
        update: {},
        create: {
            email: "admin@miniwms.com",
            username: "admin",
            password: await bcrypt_1.default.hash("admin123", SALT_ROUNDS),
            role: "ADMIN",
            warehouseId: null,
        },
    });
    console.log(`✅ Admin created: ${admin.email}`);
    // ─── 2. Warehouses ────────────────────────────────────────────────────────
    const warehouseNames = [
        "North Warehouse",
        "Central Warehouse",
        "South Warehouse",
    ];
    const warehousePrefixes = ["N", "C", "S"];
    const warehouses = [];
    for (let i = 0; i < warehouseNames.length; i++) {
        const warehouse = await prisma.warehouse.upsert({
            where: { name: warehouseNames[i] },
            update: {},
            create: { name: warehouseNames[i] },
        });
        warehouses.push(warehouse);
        console.log(`✅ Warehouse created: ${warehouse.name} (${warehouse.id})`);
    }
    // ─── 3. Managers & Staffs ─────────────────────────────────────────────────
    for (let i = 0; i < warehouses.length; i++) {
        const wh = warehouses[i];
        const managerEmail = `manager${i + 1}@miniwms.com`;
        const staffEmail = `staff${i + 1}@miniwms.com`;
        // Manager
        await prisma.user.upsert({
            where: { email: managerEmail },
            update: {},
            create: {
                email: managerEmail,
                username: `manager${i + 1}`,
                password: defaultPassword,
                role: "MANAGER",
                warehouseId: wh.id,
            },
        });
        // Staff
        await prisma.user.upsert({
            where: { email: staffEmail },
            update: {},
            create: {
                email: staffEmail,
                username: `staff${i + 1}`,
                password: defaultPassword,
                role: "STAFF",
                warehouseId: wh.id,
            },
        });
        console.log(`✅ Manager & Staff created for ${wh.name}`);
    }
    // ─── 4. Packages ──────────────────────────────────────────────────────────
    const statuses = [
        shared_types_1.PackageStatus.PENDING,
        shared_types_1.PackageStatus.IN_TRANSIT,
        shared_types_1.PackageStatus.DELIVERED,
        shared_types_1.PackageStatus.CANCELLED,
    ];
    let packagesCreatedCount = 0;
    for (let i = 0; i < warehouses.length; i++) {
        const wh = warehouses[i];
        const prefix = warehousePrefixes[i];
        // Create 15 packages per warehouse
        for (let j = 1; j <= 15; j++) {
            const code = `PKG-${prefix}-${j.toString().padStart(3, "0")}`;
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const randomPrice = Math.floor(Math.random() * 1000) + 10; // $10 to $1010
            await prisma.package.upsert({
                where: { code },
                update: {},
                create: {
                    code,
                    price: randomPrice,
                    status: randomStatus,
                    warehouseId: wh.id,
                },
            });
            packagesCreatedCount++;
        }
    }
    console.log(`✅ ${packagesCreatedCount} Packages created across all warehouses`);
    console.log("\n🎉 Seed completed successfully!");
    console.log("──────────────────────────────────────");
    console.log("  [Admin]");
    console.log("  admin@miniwms.com   / admin123");
    console.log("");
    console.log("  [Managers]");
    console.log("  manager1@miniwms.com / password123 (North)");
    console.log("  manager2@miniwms.com / password123 (Central)");
    console.log("  manager3@miniwms.com / password123 (South)");
    console.log("");
    console.log("  [Staffs]");
    console.log("  staff1@miniwms.com   / password123 (North)");
    console.log("  staff2@miniwms.com   / password123 (Central)");
    console.log("  staff3@miniwms.com   / password123 (South)");
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
