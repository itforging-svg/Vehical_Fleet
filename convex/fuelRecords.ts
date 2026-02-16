import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all fuel records with optional filters
export const list = query({
    args: {
        plant: v.optional(v.string()),
        vehicleId: v.optional(v.id("vehicles")),
    },
    handler: async (ctx, args) => {
        let records = await ctx.db.query("fuelRecords").collect();

        // Filter by plant if provided
        if (args.plant) {
            records = records.filter(r => r.plant === args.plant);
        }

        // Filter by vehicle if provided
        if (args.vehicleId) {
            records = records.filter(r => r.vehicleId === args.vehicleId);
        }

        // Sort by date (newest first)
        return records.sort((a, b) => b.refuelDate - a.refuelDate);
    },
});

// Get fuel statistics
export const getStats = query({
    args: {
        plant: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let records = await ctx.db.query("fuelRecords").collect();

        // Filter by plant if provided
        if (args.plant) {
            records = records.filter(r => r.plant === args.plant);
        }

        // Calculate current month records
        const now = Date.now();
        const startOfMonth = new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1).getTime();
        const currentMonthRecords = records.filter(r => r.refuelDate >= startOfMonth);

        const totalCost = currentMonthRecords.reduce((sum, r) => sum + r.totalCost, 0);
        const totalLiters = currentMonthRecords.reduce((sum, r) => sum + r.quantity, 0);
        const refuelsCount = currentMonthRecords.length;

        // Calculate average efficiency (only for records that have efficiency calculated)
        const recordsWithEfficiency = records.filter(r => r.fuelEfficiency !== undefined);
        const avgEfficiency = recordsWithEfficiency.length > 0
            ? recordsWithEfficiency.reduce((sum, r) => sum + (r.fuelEfficiency || 0), 0) / recordsWithEfficiency.length
            : 0;

        return {
            totalCost,
            totalLiters,
            avgEfficiency,
            refuelsCount,
        };
    },
});

// Create new fuel record
export const create = mutation({
    args: {
        vehicleId: v.id("vehicles"),
        registrationNumber: v.string(),
        driverId: v.optional(v.id("drivers")),
        driverName: v.optional(v.string()),
        fuelType: v.string(),
        quantity: v.number(),
        pricePerLiter: v.number(),
        currentOdometer: v.number(),
        location: v.optional(v.string()),
        vendorName: v.optional(v.string()),
        billNumber: v.optional(v.string()),
        plant: v.string(),
        addedBy: v.string(),
        remarks: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { vehicleId, currentOdometer, quantity, ...rest } = args;

        // Get the last fuel record for this vehicle to calculate efficiency
        const lastRecord = (await ctx.db
            .query("fuelRecords")
            .withIndex("by_vehicleId", q => q.eq("vehicleId", vehicleId))
            .collect())
            .sort((a, b) => b.refuelDate - a.refuelDate)[0];

        let lastOdometer: number | undefined = undefined;
        let distanceCovered: number | undefined = undefined;
        let fuelEfficiency: number | undefined = undefined;

        if (lastRecord && lastRecord.currentOdometer) {
            lastOdometer = lastRecord.currentOdometer;
            distanceCovered = currentOdometer - lastOdometer;

            // Calculate efficiency: distance / fuel consumed
            // Use the current fill quantity for efficiency calculation
            if (distanceCovered > 0 && quantity > 0) {
                fuelEfficiency = distanceCovered / quantity;
            }
        }

        const totalCost = args.pricePerLiter * quantity;

        const id = await ctx.db.insert("fuelRecords", {
            vehicleId,
            currentOdometer,
            quantity,
            totalCost,
            lastOdometer,
            distanceCovered,
            fuelEfficiency,
            refuelDate: Date.now(),
            ...rest,
        });

        return id;
    },
});

// Update fuel record
export const update = mutation({
    args: {
        id: v.id("fuelRecords"),
        fuelType: v.optional(v.string()),
        quantity: v.optional(v.number()),
        pricePerLiter: v.optional(v.number()),
        currentOdometer: v.optional(v.number()),
        location: v.optional(v.string()),
        vendorName: v.optional(v.string()),
        billNumber: v.optional(v.string()),
        remarks: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;

        // Recalculate total cost if price or quantity changed
        if (updates.pricePerLiter !== undefined || updates.quantity !== undefined) {
            const record = await ctx.db.get(id);
            if (record) {
                const newPrice = updates.pricePerLiter ?? record.pricePerLiter;
                const newQuantity = updates.quantity ?? record.quantity;
                (updates as any).totalCost = newPrice * newQuantity;
            }
        }

        await ctx.db.patch(id, updates);
    },
});

// Delete fuel record
export const remove = mutation({
    args: {
        id: v.id("fuelRecords"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
