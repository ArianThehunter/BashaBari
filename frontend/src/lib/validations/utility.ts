import { z } from "zod";

/**
 * Log Sub-Meter Reading Schema
 */
export const meterReadingSchema = z.object({
  property_id: z.number({ required_error: "Please select a property" }),
  building_id: z.number().optional().nullable(),
  unit_id: z.number().optional().nullable(),
  utility_provider_id: z.number({ required_error: "Please select a utility provider" }),
  meter_number: z.string().min(2, "Meter number is required"),
  previous_reading: z.number().min(0, "Previous reading must be non-negative"),
  current_reading: z.number().min(0, "Current reading must be non-negative"),
  rate_per_unit_bdt: z.number().optional().nullable(),
  reading_date: z.string().min(1, "Reading date is required"),
});

export type MeterReadingInput = z.infer<typeof meterReadingSchema>;
