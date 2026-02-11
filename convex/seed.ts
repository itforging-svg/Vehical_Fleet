import { mutation } from "./_generated/server";

export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        // 1. Seed Vehicles
        const sampleVehicles = [
            { registrationNumber: "GJ-01-AX-1234", model: "Tata Prima 4028", type: "Truck", status: "Active" },
            { registrationNumber: "GJ-01-BX-5678", model: "Mahindra Bolero", type: "Pickup", status: "Active" },
            { registrationNumber: "GJ-01-CX-9012", model: "Toyota Hilux", type: "Pickup", status: "Active" },
            { registrationNumber: "GJ-05-DZ-4321", model: "Tata Ace", type: "Mini Truck", status: "Active" },
            { registrationNumber: "GJ-05-EY-8765", model: "Ashok Leyland Dost", type: "Mini Truck", status: "In Maintenance" },
        ];

        for (const vehicle of sampleVehicles) {
            const existing = await ctx.db
                .query("vehicles")
                .withIndex("by_registrationNumber", (q) => q.eq("registrationNumber", vehicle.registrationNumber))
                .unique();

            if (!existing) {
                await ctx.db.insert("vehicles", vehicle);
                console.log(`Seeded vehicle: ${vehicle.registrationNumber}`);
            }
        }

        // 2. Seed Drivers
        const sampleDrivers = [
            { driverId: "DRV-1001", name: "Rajesh Kumar", licenseNumber: "DL-1234567890", phoneNumber: "+91 9876543210", status: "Available", licenseType: ["LMV", "HMV"] },
            { driverId: "DRV-1002", name: "Amit Shah", licenseNumber: "GJ-0987654321", phoneNumber: "+91 8765432109", status: "Available", licenseType: ["LMV"] },
            { driverId: "DRV-1003", name: "Suresh Patel", licenseNumber: "MH-5678901234", phoneNumber: "+91 7654321098", status: "On Duty", licenseType: ["HMV", "Transport"] },
        ];

        for (const driver of sampleDrivers) {
            const existing = await ctx.db
                .query("drivers")
                .withIndex("by_licenseNumber", (q) => q.eq("licenseNumber", driver.licenseNumber))
                .unique();

            if (!existing) {
                await ctx.db.insert("drivers", driver);
                console.log(`Seeded driver: ${driver.name}`);
            }
        }

        return "Seeding completed successfully!";
    },
});
