import { internalMutation, mutation } from "./_generated/server";
import { adminMutation, adminQuery } from "./functions";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

export const login = mutation({
    args: {
        adminId: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_adminId", (q) => q.eq("adminId", args.adminId))
            .unique();

        if (!admin || !bcrypt.compareSync(args.password, admin.password)) {
            throw new Error("Invalid Admin ID or Password");
        }

        const sessionToken = crypto.randomUUID();
        const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
        await ctx.db.insert("adminSessions", { token: sessionToken, adminId: admin.adminId, expiresAt });

        return {
            adminId: admin.adminId,
            name: admin.name,
            plant: admin.plant,
            sessionToken,
            expiresAt,
        };
    },
});

export const logout = mutation({
    args: { sessionToken: v.string() },
    handler: async (ctx, { sessionToken }) => {
        const session = await ctx.db
            .query("adminSessions")
            .withIndex("by_token", (q) => q.eq("token", sessionToken))
            .unique();
        if (session) await ctx.db.delete(session._id);
    },
});

export const getAdmin = adminQuery({
    args: { adminId: v.string() },
    handler: async (ctx, args) => {
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_adminId", (q) => q.eq("adminId", args.adminId))
            .unique();
        return admin ? { adminId: admin.adminId, name: admin.name, plant: admin.plant } : null;
    },
});

// Safely add (or update) a single admin without touching other accounts
export const addAdmin = adminMutation({
    args: {
        adminId: v.string(),
        password: v.string(),
        name: v.string(),
        plant: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (!["cslsuperadmin", "masteradmin"].includes(ctx.admin.adminId)) {
            throw new Error("Only a Super Admin can manage admin accounts");
        }
        if (args.password.length < 12) throw new Error("Admin passwords must be at least 12 characters");
        // Check if admin already exists
        const existing = await ctx.db
            .query("admins")
            .withIndex("by_adminId", (q) => q.eq("adminId", args.adminId))
            .unique();

        const hashedPassword = bcrypt.hashSync(args.password, 12);

        if (existing) {
            // Update existing
            await ctx.db.patch(existing._id, {
                password: hashedPassword,
                name: args.name,
                plant: args.plant,
            });
            return `Updated admin: ${args.adminId}`;
        } else {
            // Insert new
            await ctx.db.insert("admins", {
                adminId: args.adminId,
                password: hashedPassword,
                name: args.name,
                plant: args.plant,
            });
            return `Created admin: ${args.adminId}`;
        }
    },
});

// Provision one account through the authenticated Convex CLI/dashboard only.
// Unlike the old seed function, this never deletes or resets other admins.
export const provisionAdmin = internalMutation({
    args: {
        adminId: v.string(),
        password: v.string(),
        name: v.string(),
        plant: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (args.password.length < 12) throw new Error("Admin passwords must be at least 12 characters");
        const existing = await ctx.db.query("admins")
            .withIndex("by_adminId", (q) => q.eq("adminId", args.adminId))
            .unique();
        const password = bcrypt.hashSync(args.password, 12);
        if (existing) {
            await ctx.db.patch(existing._id, { password, name: args.name, plant: args.plant });
            return "Admin account updated";
        }
        await ctx.db.insert("admins", { ...args, password });
        return "Admin account created";
    },
});
