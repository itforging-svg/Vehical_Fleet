import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Returns the last known odometer reading for a given vehicleId.
 * Returns null if no history exists or if vehicleId is empty.
 * Uses "skip" string to conditionally avoid running when vehicleId is empty.
 */
export function useLastOdometer(vehicleId: string | undefined) {
    const result = useQuery(
        api.vehicles.getLastOdometer,
        vehicleId ? { vehicleId: vehicleId as Id<"vehicles"> } : "skip"
    );
    return result ?? null;
}
