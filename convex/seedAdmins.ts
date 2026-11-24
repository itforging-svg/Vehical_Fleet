import { internalMutation } from "./_generated/server";

export const seed = internalMutation({
    args: {},
    handler: async (ctx) => {
        // This internal migration deliberately preserves all admin accounts.
        const db = ctx.db as any;
        // 1. Update Vehicles
        const vehicles = await db.query("vehicles").collect();
        for (const v of vehicles) {
            if (v.locationPlant === "Seamsless") {
                await db.patch(v._id, { locationPlant: "Seamless" });
            }
        }

        // 2. Update Requests
        try {
            const requests = await db.query("requests").collect();
            for (const r of requests) {
                if (r.plant === "Seamsless") {
                    await db.patch(r._id, { plant: "Seamless" });
                }
            }
        } catch { /* ignore if table doesn't exist */ }

        // 3. Update Internal Movements
        try {
            const movements = await db.query("internalMovements").collect();
            for (const m of movements) {
                if (m.from === "Seamsless") await db.patch(m._id, { from: "Seamless" });
                if (m.to === "Seamsless") await db.patch(m._id, { to: "Seamless" });
            }
        } catch { /* ignore if table doesn't exist */ }
        // --- END MIGRATION LOGIC ---

        return "Migrated Seamsless -> Seamless; admin accounts were preserved";
    },
});
