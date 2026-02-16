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
            { adminId: "admin_seamless", password: "admin123", name: "Seamless Admin", plant: "Seamsless" },
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

        return "Successfully seeded 9 admin accounts with hashed passwords";
    },
});
