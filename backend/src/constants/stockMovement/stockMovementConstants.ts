/**
 * @summary
 * Constants for Stock Movement feature.
 * Defines movement types, limits, and default values.
 *
 * @module constants/stockMovement/stockMovementConstants
 */

/**
 * @interface StockMovementTypesType
 * @description Available types of stock movements.
 */
export const STOCK_MOVEMENT_TYPES = {
  CREATION: 'CREATION',
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND',
  ADJUSTMENT: 'ADJUSTMENT',
  DELETION: 'DELETION',
} as const;

export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[keyof typeof STOCK_MOVEMENT_TYPES];

/**
 * @interface ProductStatusType
 * @description Product lifecycle statuses.
 */
export const PRODUCT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

/**
 * @interface StockMovementLimitsType
 * @description Validation constraints for fields.
 */
export const STOCK_MOVEMENT_LIMITS = {
  PRODUCT_NAME_MIN: 3,
  PRODUCT_NAME_MAX: 100,
  SKU_MIN: 1,
  SKU_MAX: 100,
  DESCRIPTION_MAX: 500,
  REASON_MIN: 10,
  REASON_MAX: 200,
  DOC_REF_MAX: 50,
} as const;

/**
 * @interface UnitOfMeasureType
 * @description Allowed units of measure.
 */
export const UNITS_OF_MEASURE = ['UN', 'CX', 'KG', 'L', 'M'] as const;
export type UnitOfMeasure = (typeof UNITS_OF_MEASURE)[number];
