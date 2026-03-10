import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: { plant: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const vehicles = (await ctx.db.query("vehicles").collect()).filter(v => v.deletedAt === undefined);
        if (args.plant) {
            return vehicles.filter(v => v.locationPlant === args.plant);
        }
        return vehicles;
    },
});

export const getLastOdometer = query({
    args: { vehicleId: v.id("vehicles") },
    handler: async (ctx, args) => {
        // Max odometer from trips
        const trips = await ctx.db.query("trips")
            .withIndex("by_vehicleId", q => q.eq("vehicleId", args.vehicleId))
            .collect();
        const lastTripOdo = trips.reduce((max, t) => {
            const odo = t.endOdometer ?? t.startOdometer ?? 0;
            return Math.max(max, odo);
        }, 0);

        // Max odometer from fuel records
        const fuelRecords = await ctx.db.query("fuelRecords")
            .withIndex("by_vehicleId", q => q.eq("vehicleId", args.vehicleId))
            .collect();
        const lastFuelOdo = fuelRecords.reduce((max, r) => Math.max(max, r.currentOdometer), 0);

        // Max odometer from maintenance records
        const maintenanceRecords = await ctx.db.query("maintenanceRecords")
            .withIndex("by_vehicleId", q => q.eq("vehicleId", args.vehicleId))
            .collect();
        const lastMaintenanceOdo = maintenanceRecords.reduce((max, r) => Math.max(max, r.odometer), 0);

        const lastOdo = Math.max(lastTripOdo, lastFuelOdo, lastMaintenanceOdo);
        return lastOdo > 0 ? lastOdo : null;
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
        photoId: v.optional(v.id("_storage")),
        rcFileId: v.optional(v.id("_storage")),
        insuranceId: v.optional(v.id("_storage")),
        pucId: v.optional(v.id("_storage")),
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
        const id = await ctx.db.insert("vehicles", args);
        await ctx.db.insert("auditLogs", {
            action: "CREATE",
            module: "Vehicles",
            recordId: id,
            details: `Created vehicle: ${args.registrationNumber} (${args.model})`,
            performedBy: args.addedBy ?? "Unknown Admin",
            timestamp: Date.now(),
            plant: args.locationPlant,
        });
        return id;
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
        status: v.optional(v.string()),
        addedBy: v.optional(v.string()),
        remarks: v.optional(v.string()),
        photoId: v.optional(v.id("_storage")),
        rcFileId: v.optional(v.id("_storage")),
        insuranceId: v.optional(v.id("_storage")),
        pucId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        await ctx.db.patch(id, data);
        await ctx.db.insert("auditLogs", {
            action: "UPDATE",
            module: "Vehicles",
            recordId: id,
            details: `Updated vehicle: ${data.registrationNumber}`,
            performedBy: data.addedBy ?? "Unknown Admin",
            timestamp: Date.now(),
            plant: data.locationPlant,
        });
    },
});

export const remove = mutation({
    args: {
        id: v.id("vehicles"),
        performedBy: v.string(), // Added for auditing
    },
    handler: async (ctx, args) => {
        const vehicle = await ctx.db.get(args.id);
        await ctx.db.patch(args.id, { deletedAt: Date.now() });
        await ctx.db.insert("auditLogs", {
            action: "DELETE",
            module: "Vehicles",
            recordId: args.id,
            details: `Deleted vehicle: ${vehicle?.registrationNumber || "Unknown"}`,
            performedBy: args.performedBy,
            timestamp: Date.now(),
            plant: vehicle?.locationPlant,
        });
    },
});
