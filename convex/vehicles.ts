import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("vehicles").collect();
    },
});

export const getByRegNo = query({
    args: { registrationNumber: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("vehicles")
            .withIndex("by_registrationNumber", (q) =>
                q.eq("registrationNumber", args.registrationNumber)
            )
            .unique();
    },
});

export const create = mutation({
    args: {
        registrationNumber: v.string(),
        chassisNumber: v.optional(v.string()),
        engineNumber: v.optional(v.string()),
        type: v.string(),
        category: v.optional(v.string()),
        make: v.optional(v.string()),
        model: v.string(),
        variant: v.optional(v.string()),
        manufacturingYear: v.optional(v.string()),
        fuelType: v.optional(v.string()),
        transmission: v.optional(v.string()),
        rcExpiryDate: v.optional(v.string()),
        insuranceProvider: v.optional(v.string()),
        insurancePolicyNumber: v.optional(v.string()),
        insuranceExpiryDate: v.optional(v.string()),
        pucExpiryDate: v.optional(v.string()),
        fitnessExpiryDate: v.optional(v.string()),
        permitType: v.optional(v.string()),
        permitExpiryDate: v.optional(v.string()),
        ownershipType: v.optional(v.string()),
        assignedDepartment: v.optional(v.string()),
        assignedDriver: v.optional(v.string()),
        locationPlant: v.optional(v.string()),
        vendorName: v.optional(v.string()),
        status: v.string(),
        addedBy: v.optional(v.string()),
        remarks: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("vehicles")
            .withIndex("by_registrationNumber", (q) =>
                q.eq("registrationNumber", args.registrationNumber)
            )
            .unique();
        if (existing) {
            throw new Error("Vehicle already exists");
        }
        return await ctx.db.insert("vehicles", args);
    },
});

export const update = mutation({
    args: {
        id: v.id("vehicles"),
        registrationNumber: v.string(),
        chassisNumber: v.optional(v.string()),
        engineNumber: v.optional(v.string()),
        type: v.string(),
        category: v.optional(v.string()),
        make: v.optional(v.string()),
        model: v.string(),
        variant: v.optional(v.string()),
        manufacturingYear: v.optional(v.string()),
        fuelType: v.optional(v.string()),
        transmission: v.optional(v.string()),
        rcExpiryDate: v.optional(v.string()),
        insuranceProvider: v.optional(v.string()),
        insurancePolicyNumber: v.optional(v.string()),
        insuranceExpiryDate: v.optional(v.string()),
        pucExpiryDate: v.optional(v.string()),
        fitnessExpiryDate: v.optional(v.string()),
        permitType: v.optional(v.string()),
        permitExpiryDate: v.optional(v.string()),
        ownershipType: v.optional(v.string()),
        assignedDepartment: v.optional(v.string()),
        assignedDriver: v.optional(v.string()),
        locationPlant: v.optional(v.string()),
        vendorName: v.optional(v.string()),
        status: v.string(),
        addedBy: v.optional(v.string()),
        remarks: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        await ctx.db.patch(id, data);
    },
});

export const remove = mutation({
    args: { id: v.id("vehicles") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
