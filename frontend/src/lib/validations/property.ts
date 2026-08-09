import { z } from "zod";

/**
 * Property Creation / Update Schema
 */
export const propertySchema = z.object({
  name: z
    .string()
    .min(2, "Property name must be at least 2 characters")
    .max(150, "Property name cannot exceed 150 characters"),
  address: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  description: z.string().optional(),
});

export type PropertyInput = z.infer<typeof propertySchema>;

/**
 * Building Creation / Update Schema
 */
export const buildingSchema = z.object({
  property_id: z.number({ required_error: "Property is required" }),
  name: z.string().min(1, "Building name is required"),
  total_floors: z
    .number()
    .min(1, "Total floors must be at least 1")
    .max(100, "Maximum 100 floors supported")
    .optional(),
});

export type BuildingInput = z.infer<typeof buildingSchema>;

/**
 * Unit Creation / Update Schema
 */
export const unitSchema = z.object({
  floor_id: z.number({ required_error: "Floor is required" }),
  unit_number: z.string().min(1, "Unit number or flat name is required"),
  unit_type: z.enum(["residential", "commercial", "garage", "storage"], {
    required_error: "Please select a unit type",
  }),
  bedrooms: z.number().min(0).optional().nullable(),
  bathrooms: z.number().min(0).optional().nullable(),
  area_sqft: z.number().min(0).optional().nullable(),
  base_rent_bdt: z.number().min(0, "Base rent cannot be negative"), // In BDT (user input)
  occupancy_status: z.enum(["vacant", "occupied", "maintenance", "reserved"]),
  notes: z.string().optional().nullable(),
});

export type UnitInput = z.infer<typeof unitSchema>;
