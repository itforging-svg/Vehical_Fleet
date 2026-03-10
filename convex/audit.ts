import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
    args: {
        plant: v.optional(v.string()),
        module: v.optional(v.string()),
        action: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let logs = await ctx.db
            .query("auditLogs")
            .order("desc")
            .collect();

        if (args.plant) {
            logs = logs.filter((log) => !log.plant || log.plant === args.plant);
        }
        if (args.module) {
            logs = logs.filter((log) => log.module === args.module);
        }
        if (args.action) {
            logs = logs.filter((log) => log.action === args.action);
        }

        return logs;
    },
});

// Internal mutation to be called from other mutations
export const logAction = mutation({
    args: {
        action: v.string(),
        module: v.string(),
        recordId: v.string(),
        details: v.string(),
        performedBy: v.string(),
        plant: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("auditLogs", {
            ...args,
            timestamp: Date.now(),
        });
    },
});
