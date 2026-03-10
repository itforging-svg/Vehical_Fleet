import { mutation } from "./_generated/server";
import bcrypt from "bcryptjs";

export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        // Delete existing admins to ensure clean state for hashing
        const existing = await ctx.db.query("admins").collect();
        for (const admin of existing) {
            await ctx.db.delete(admin._id);
        }

        const admins = [
            { adminId: "cslsuperadmin", password: "cslsuperadmin", name: "Super Admin", plant: undefined },
            { adminId: "admin_seamless", password: "admin123", name: "Seamless Admin", plant: "Seamless" },
            { adminId: "admin_forging", password: "admin123", name: "Forging Admin", plant: "Forging" },
            { adminId: "admin_main", password: "admin123", name: "Main Plant Admin", plant: "Main Plant (SMS)" },
            { adminId: "admin_bright", password: "admin123", name: "Bright Bar Admin", plant: "Bright Bar" },
            { adminId: "admin_flat", password: "admin123", name: "Flat Bar Admin", plant: "Flat Bar" },
            { adminId: "admin_wire", password: "admin123", name: "Wire Plant Admin", plant: "Wire Plant" },
            { adminId: "admin_main2", password: "admin123", name: "Main Plant 2 Admin", plant: "Main Plant 2 ( SMS 2 )" },
            { adminId: "admin_40inch", password: "admin123", name: "40Inch Mill Admin", plant: "40\"Inch Mill" },
        ];

        for (const admin of admins) {
            const hashedPassword = bcrypt.hashSync(admin.password, 10);
            await ctx.db.insert("admins", {
                ...admin,
                password: hashedPassword
            });
        }

        // --- MIGRATION LOGIC ---
        // 1. Update Vehicles
        const db = ctx.db as any;
        const vehicles = await db.query("vehicles").collect();
        for (const v of vehicles) {
            if (v.locationPlant === "Seamsless") {
                await db.patch(v._id, { locationPlant: "Seamless" });
            }
        }

        // 2. Update Requests
        try {
            const requests = await db.query("requests").collect();
            for (const r of requests) {
                if (r.plant === "Seamsless") {
                    await db.patch(r._id, { plant: "Seamless" });
                }
            }
        } catch (e) { /* ignore if table doesn't exist */ }

        // 3. Update Internal Movements
        try {
            const movements = await db.query("internalMovements").collect();
            for (const m of movements) {
                if (m.from === "Seamsless") await db.patch(m._id, { from: "Seamless" });
                if (m.to === "Seamsless") await db.patch(m._id, { to: "Seamless" });
            }
        } catch (e) { /* ignore if table doesn't exist */ }
        // --- END MIGRATION LOGIC ---

        return "Successfully seeded 9 admin accounts and migrated Seamsless -> Seamless";
    },
});
