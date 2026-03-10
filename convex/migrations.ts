import { mutation } from "./_generated/server";

export const migratePlantNames = mutation({
    args: {},
    handler: async (ctx) => {
        // 1. Update Vehicles
        const vehicles = await ctx.db.query("vehicles").collect();
        for (const v of vehicles) {
            if (v.locationPlant === "Seamsless") {
                await ctx.db.patch(v._id, { locationPlant: "Seamless" });
            }
        }

        // 2. Update Admins
        const admins = await ctx.db.query("admins").collect();
        for (const a of admins) {
            if (a.plant === "Seamsless") {
                await ctx.db.patch(a._id, { plant: "Seamless" });
            }
        }

        // 3. Update Requests
        const requests = await ctx.db.query("requests").collect();
        for (const r of requests) {
            if (r.plant === "Seamsless") {
                await ctx.db.patch(r._id, { plant: "Seamless" });
            }
        }

        // 4. Update Internal Movements
        const movements = await ctx.db.query("internalMovements").collect();
        for (const m of movements) {
            if (m.from === "Seamsless") await ctx.db.patch(m._id, { from: "Seamless" });
            if (m.to === "Seamsless") await ctx.db.patch(m._id, { to: "Seamless" });
        }

        return "Migration completed: Updated Seamsless to Seamless in vehicles, admins, requests, and movements.";
    },
});
