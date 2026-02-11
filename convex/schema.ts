import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  vehicles: defineTable({
    // Identification
    registrationNumber: v.string(),
    chassisNumber: v.optional(v.string()),
    engineNumber: v.optional(v.string()),
    type: v.string(), // Car / Truck / Bus / 2W / JCB / Hydra / Dumper / Tractor
    category: v.optional(v.string()), // Pool / Assigned / Logistics / Executive
    make: v.optional(v.string()), // Tata, Mahindra, etc.
    model: v.string(),
    variant: v.optional(v.string()),
    manufacturingYear: v.optional(v.string()),
    fuelType: v.optional(v.string()), // Petrol / Diesel / EV / CNG
    transmission: v.optional(v.string()), // Manual / Automatic

    // Compliance & Legal
    rcExpiryDate: v.optional(v.string()),
    insuranceProvider: v.optional(v.string()),
    insurancePolicyNumber: v.optional(v.string()),
    insuranceExpiryDate: v.optional(v.string()),
    pucExpiryDate: v.optional(v.string()),
    fitnessExpiryDate: v.optional(v.string()),
    permitType: v.optional(v.string()), // National / State / Local
    permitExpiryDate: v.optional(v.string()),

    // Ownership
    ownershipType: v.optional(v.string()), // Company-owned / Leased / Vendor
    assignedDepartment: v.optional(v.string()),
    assignedDriver: v.optional(v.string()),
    locationPlant: v.optional(v.string()),
    vendorName: v.optional(v.string()),

    // System Metadata
    status: v.string(), // Active / In maintenance / Decommissioned
    addedBy: v.optional(v.string()),
    remarks: v.optional(v.string()),
  }).index("by_registrationNumber", ["registrationNumber"]),

  drivers: defineTable({
    driverId: v.string(),
    name: v.string(),
    phoneNumber: v.string(),
    dob: v.optional(v.string()),
    bloodGroup: v.optional(v.string()),
    photo: v.optional(v.string()),
    licenseNumber: v.string(),
    licenseType: v.array(v.string()), // LMV / HMV / Transport
    licenseIssueDate: v.optional(v.string()),
    licenseValidity: v.optional(v.string()),
    licenseIssuedBy: v.optional(v.string()),
    status: v.string(), // e.g. "Available", "On Duty", "Inactive"
    addedBy: v.optional(v.string()),
    addedDate: v.optional(v.string()),
  }).index("by_licenseNumber", ["licenseNumber"])
    .index("by_driverId", ["driverId"]),

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

  notifications: defineTable({
    type: v.string(), // "RC", "INSURANCE", "PUC", "FITNESS"
    vehicleId: v.id("vehicles"),
    registrationNumber: v.string(),
    title: v.string(),
    message: v.string(),
    status: v.string(), // "unread", "read"
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_vehicle_type", ["vehicleId", "type"]),
});
