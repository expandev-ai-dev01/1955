/**
 * @summary
 * Type definitions for Stock Movement feature.
 *
 * @module services/stockMovement/stockMovementTypes
 */

import { ProductStatus, StockMovementType, UnitOfMeasure } from '@/constants/stockMovement';

/**
 * @interface ProductEntity
 * @description Represents a product in the system.
 */
export interface ProductEntity {
  id: string; // UUID
  name: string;
  sku: string;
  description: string | null;
  unitOfMeasure: UnitOfMeasure;
  status: ProductStatus;
  dateCreated: string;
  dateModified: string;
}

/**
 * @interface StockMovementEntity
 * @description Represents a stock movement record.
 */
export interface StockMovementEntity {
  id: string; // UUID
  productId: string; // UUID
  userId: string; // UUID
  type: StockMovementType;
  quantityChange: number;
  reason: string | null;
  documentReference: string | null;
  timestamp: string;
}

/**
 * @interface StockBalanceResponse
 * @description Response for balance inquiry.
 */
export interface StockBalanceResponse {
  productId: string;
  balance: number;
  lastUpdated: string;
}

/**
 * @interface StockHistoryResponse
 * @description Response for movement history.
 */
export interface StockHistoryResponse {
  movements: StockMovementEntity[];
  totalCount: number;
}
