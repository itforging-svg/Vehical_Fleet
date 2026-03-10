import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("drivers").collect();
        return all.filter(d => d.deletedAt === undefined);
    },
});

export const create = mutation({
    args: {
        driverId: v.string(),
        name: v.string(),
        phoneNumber: v.string(),
        dob: v.optional(v.string()),
        bloodGroup: v.optional(v.string()),
        photo: v.optional(v.string()),
        licenseNumber: v.string(),
        licenseType: v.array(v.string()),
        licenseIssueDate: v.optional(v.string()),
        licenseValidity: v.optional(v.string()),
        licenseIssuedBy: v.optional(v.string()),
        status: v.string(),
        address: v.optional(v.string()),
        plant: v.optional(v.string()),
        addedBy: v.optional(v.string()),
        addedDate: v.optional(v.string()),
        photoId: v.optional(v.id("_storage")),
        licenseFrontId: v.optional(v.id("_storage")),
        licenseBackId: v.optional(v.id("_storage")),
        aadharId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("drivers")
            .withIndex("by_licenseNumber", (q) =>
                q.eq("licenseNumber", args.licenseNumber)
            )
            .unique();
        if (existing) {
            throw new Error("Driver with this license already exists");
        }
        const id = await ctx.db.insert("drivers", args);
        await ctx.db.insert("auditLogs", {
            action: "CREATE",
            module: "Drivers",
            recordId: id,
            details: `Created driver: ${args.name} (${args.driverId})`,
            performedBy: args.addedBy ?? "Unknown Admin",
            timestamp: Date.now(),
            plant: args.plant,
        });
        return id;
    },
});

export const update = mutation({
    args: {
        id: v.id("drivers"),
        driverId: v.string(),
        name: v.string(),
        phoneNumber: v.string(),
        dob: v.optional(v.string()),
        bloodGroup: v.optional(v.string()),
        photo: v.optional(v.string()),
        licenseNumber: v.string(),
        licenseType: v.array(v.string()),
        licenseIssueDate: v.optional(v.string()),
        licenseValidity: v.optional(v.string()),
        licenseIssuedBy: v.optional(v.string()),
        status: v.string(),
        address: v.optional(v.string()),
        plant: v.optional(v.string()),
        addedBy: v.optional(v.string()),
        addedDate: v.optional(v.string()),
        photoId: v.optional(v.id("_storage")),
        licenseFrontId: v.optional(v.id("_storage")),
        licenseBackId: v.optional(v.id("_storage")),
        aadharId: v.optional(v.id("_storage")),
        performedBy: v.string(), // Added for auditing
    },
    handler: async (ctx, args) => {
        const { id, performedBy, ...data } = args;
        await ctx.db.patch(id, data);
        await ctx.db.insert("auditLogs", {
            action: "UPDATE",
            module: "Drivers",
            recordId: id,
            details: `Updated driver: ${data.name} (${data.driverId})`,
            performedBy: performedBy,
            timestamp: Date.now(),
            plant: data.plant,
        });
    },
});

export const remove = mutation({
    args: {
        id: v.id("drivers"),
        performedBy: v.string(), // Added for auditing
    },
    handler: async (ctx, args) => {
        const driver = await ctx.db.get(args.id);
        await ctx.db.patch(args.id, { deletedAt: Date.now() });
        await ctx.db.insert("auditLogs", {
            action: "DELETE",
            module: "Drivers",
            recordId: args.id,
            details: `Deleted driver: ${driver?.name || "Unknown"}`,
            performedBy: args.performedBy,
            timestamp: Date.now(),
            plant: driver?.plant,
        });
    },
});

export const getPerformanceStats = query({
    args: { plant: v.optional(v.string()) },
    handler: async (ctx, args) => {
        // 1. Get all active drivers
        let drivers = (await ctx.db.query("drivers").collect()).filter(d => d.deletedAt === undefined);

        if (args.plant) {
            drivers = drivers.filter(d => d.plant === args.plant);
        }

        // 2. Get all completed trips (to calculate Km driven & Trips count)
        const allTrips = (await ctx.db.query("trips").collect()).filter(t => t.status === "Completed");

        // 3. Get all fuel records (to calculate Fuel consumed & Cost)
        const allFuel = await ctx.db.query("fuelRecords").collect();

        // 4. Aggregate stats per driver
        const performanceData = drivers.map(driver => {
            const driverTrips = allTrips.filter(t => t.driverId === driver._id);
            const driverFuel = allFuel.filter(f => f.driverId === driver._id && f.deletedAt === undefined);

            const tripsCompleted = driverTrips.length;
            const kmDriven = driverTrips.reduce((sum, trip) => {
                if (trip.startOdometer && trip.endOdometer) {
                    return sum + (trip.endOdometer - trip.startOdometer);
                }
                return sum;
            }, 0);

            const fuelConsumed = driverFuel.reduce((sum, f) => sum + f.quantity, 0);
            const fuelCost = driverFuel.reduce((sum, f) => sum + f.totalCost, 0);

            return {
                driverId: driver._id,
                driverEmpId: driver.driverId,
                name: driver.name,
                photoId: driver.photoId,
                plant: driver.plant,
                tripsCompleted,
                kmDriven,
                fuelConsumed,
                fuelCost,
                status: driver.status
            };
        });

        // 5. Sort by Km Driven (descending) by default
        return performanceData.sort((a, b) => b.kmDriven - a.kmDriven);
    }
});
