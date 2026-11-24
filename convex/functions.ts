import { customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

const adminSession = {
  args: { sessionToken: v.string() },
  input: async (ctx: QueryCtx | MutationCtx, { sessionToken }: { sessionToken: string }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", sessionToken))
      .unique();
    if (!session || session.expiresAt <= Date.now()) {
      throw new Error("Authentication required");
    }
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_adminId", (q) => q.eq("adminId", session.adminId))
      .unique();
    if (!admin) throw new Error("Authentication required");
    return { ctx: { admin }, args: {} };
  },
};

export const adminQuery = customQuery(query, adminSession);
export const adminMutation = customMutation(mutation, adminSession);

export function assertPlantAccess(adminPlant: string | undefined, recordPlant: string | undefined) {
  if (adminPlant && adminPlant !== recordPlant) throw new Error("Forbidden: this record belongs to another plant");
}

export function assertTripPlantAccess(adminPlant: string | undefined, startLocation: string, endLocation: string) {
  if (adminPlant && startLocation !== adminPlant && endLocation !== adminPlant) {
    throw new Error("Forbidden: this trip belongs to another plant");
  }
}

export function assertSuperAdmin(adminId: string) {
  if (adminId !== "cslsuperadmin" && adminId !== "masteradmin") {
    throw new Error("Forbidden: Super Admin access required");
  }
}
