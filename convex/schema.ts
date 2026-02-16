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
    status: v.string(), // Active / In maintenance / Decommissioned / On Duty
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
    startOdometer: v.optional(v.number()),
    endOdometer: v.optional(v.number()),
    status: v.string(), // e.g. "Pending", "In Progress", "Completed", "Cancelled"
    requestId: v.optional(v.string()), // Linked from vehicleRequests
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

  vehicleRequests: defineTable({
    requestId: v.string(),
    requesterName: v.string(),
    employeeId: v.string(),
    department: v.string(),
    plant: v.string(),
    contactNumber: v.string(),
    purpose: v.string(),
    priority: v.string(),
    pickupLocation: v.string(),
    dropLocation: v.string(),
    tripType: v.string(),
    vehicleType: v.string(),
    bookingDateTime: v.optional(v.string()), // For advance booking (IST format)
    status: v.string(), // "pending", "approved", "rejected", "completed"
    vehicleId: v.optional(v.id("vehicles")),
    driverId: v.optional(v.id("drivers")),
    createdAt: v.number(),
  })
    .index("by_requestId", ["requestId"])
    .index("by_status", ["status"]),

  admins: defineTable({
    adminId: v.string(),
    password: v.string(),
    plant: v.optional(v.string()), // Null for Superadmin
    name: v.string(),
  }).index("by_adminId", ["adminId"]),

  fuelRecords: defineTable({
    vehicleId: v.id("vehicles"),
    registrationNumber: v.string(), // Denormalized for easy reference
    driverId: v.optional(v.id("drivers")),
    driverName: v.optional(v.string()),

    // Fuel Transaction Details
    fuelType: v.string(), // Petrol, Diesel, CNG
    quantity: v.number(), // in liters
    pricePerLiter: v.number(),
    totalCost: v.number(),

    // Odometer & Efficiency
    currentOdometer: v.number(),
    lastOdometer: v.optional(v.number()),
    distanceCovered: v.optional(v.number()), // km since last refuel
    fuelEfficiency: v.optional(v.number()), // km/liter (calculated)

    // Location & Vendor
    location: v.optional(v.string()), // Where fuel was purchased
    vendorName: v.optional(v.string()), // Fuel station name
    billNumber: v.optional(v.string()),
    plant: v.string(), // Plant assignment

    // System Metadata
    refuelDate: v.number(), // timestamp
    addedBy: v.string(), // Admin who added the record
    remarks: v.optional(v.string()),
  })
    .index("by_vehicleId", ["vehicleId"])
    .index("by_plant", ["plant"])
    .index("by_date", ["refuelDate"]),
});
