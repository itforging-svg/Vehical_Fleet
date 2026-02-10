import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  vehicles: defineTable({
    registrationNumber: v.string(),
    model: v.string(),
    type: v.string(), // e.g. "Truck", "Van", "Sedan"
    status: v.string(), // e.g. "Active", "In Maintenance", "Inactive"
    owner: v.optional(v.string()),
  }).index("by_registrationNumber", ["registrationNumber"]),

  drivers: defineTable({
    name: v.string(),
    licenseNumber: v.string(),
    phoneNumber: v.string(),
    status: v.string(), // e.g. "Available", "On Duty", "Inactive"
  }).index("by_licenseNumber", ["licenseNumber"]),

  trips: defineTable({
    vehicleId: v.optional(v.id("vehicles")),
    driverId: v.optional(v.id("drivers")),
    requesterName: v.optional(v.string()),
    requesterDepartment: v.optional(v.string()),
    purpose: v.optional(v.string()),
    startLocation: v.string(),
    endLocation: v.string(),
    startTime: v.number(), // timestamp
    endTime: v.optional(v.number()), // timestamp
    status: v.string(), // e.g. "Pending", "In Progress", "Completed", "Cancelled"
    notes: v.optional(v.string()),
  }).index("by_vehicleId", ["vehicleId"]),
});
