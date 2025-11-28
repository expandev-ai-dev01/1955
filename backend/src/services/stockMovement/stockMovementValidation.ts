/**
 * @summary
 * Validation schemas for Stock Movement feature.
 *
 * @module services/stockMovement/stockMovementValidation
 */

import { z } from 'zod';
import {
  STOCK_MOVEMENT_LIMITS,
  STOCK_MOVEMENT_TYPES,
  UNITS_OF_MEASURE,
} from '@/constants/stockMovement';

// Common fields
const quantityPositive = z.number().positive();
const quantityNonNegative = z.number().min(0);
const quantityAny = z.number().refine((val) => val !== 0, { message: 'Quantity cannot be zero' });
const reasonSchema = z
  .string()
  .min(STOCK_MOVEMENT_LIMITS.REASON_MIN)
  .max(STOCK_MOVEMENT_LIMITS.REASON_MAX);
const docRefSchema = z.string().max(STOCK_MOVEMENT_LIMITS.DOC_REF_MAX).optional();

// FC-001: Creation
export const creationSchema = z.object({
  movement_type: z.literal(STOCK_MOVEMENT_TYPES.CREATION),
  product_name: z
    .string()
    .min(STOCK_MOVEMENT_LIMITS.PRODUCT_NAME_MIN)
    .max(STOCK_MOVEMENT_LIMITS.PRODUCT_NAME_MAX),
  product_sku: z
    .string()
    .min(STOCK_MOVEMENT_LIMITS.SKU_MIN)
    .max(STOCK_MOVEMENT_LIMITS.SKU_MAX)
    .regex(/^[^\s]+$/, 'SKU cannot contain spaces'),
  product_description: z.string().max(STOCK_MOVEMENT_LIMITS.DESCRIPTION_MAX).optional(),
  unit_of_measure: z.enum(UNITS_OF_MEASURE),
  quantity_change: quantityNonNegative,
});

// FC-002: Inbound
export const inboundSchema = z.object({
  movement_type: z.literal(STOCK_MOVEMENT_TYPES.INBOUND),
  product_id: z.string().uuid(),
  quantity_change: quantityPositive,
  document_reference: docRefSchema,
});

// FC-003: Outbound
export const outboundSchema = z.object({
  movement_type: z.literal(STOCK_MOVEMENT_TYPES.OUTBOUND),
  product_id: z.string().uuid(),
  quantity_change: quantityPositive, // Input is positive, system treats as decrement
  document_reference: docRefSchema,
});

// FC-004: Adjustment
export const adjustmentSchema = z.object({
  movement_type: z.literal(STOCK_MOVEMENT_TYPES.ADJUSTMENT),
  product_id: z.string().uuid(),
  quantity_change: quantityAny,
  reason: reasonSchema,
});

// FC-005: Deletion
export const deletionSchema = z.object({
  movement_type: z.literal(STOCK_MOVEMENT_TYPES.DELETION),
  product_id: z.string().uuid(),
  reason: reasonSchema,
});

// Unified schema
export const registerMovementSchema = z.discriminatedUnion('movement_type', [
  creationSchema,
  inboundSchema,
  outboundSchema,
  adjustmentSchema,
  deletionSchema,
]);

export type RegisterMovementInput = z.infer<typeof registerMovementSchema>;
