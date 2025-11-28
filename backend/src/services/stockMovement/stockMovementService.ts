/**
 * @summary
 * Business logic for Stock Movement feature.
 * Handles all movement types, balance calculations, and product lifecycle.
 *
 * @module services/stockMovement/stockMovementService
 */

import { randomUUID } from 'crypto';
import { ServiceError } from '@/utils';
import { stockMovementStore } from '@/instances';
import { PRODUCT_STATUS, STOCK_MOVEMENT_TYPES } from '@/constants/stockMovement';
import { RegisterMovementInput, registerMovementSchema } from './stockMovementValidation';
import {
  ProductEntity,
  StockMovementEntity,
  StockBalanceResponse,
  StockHistoryResponse,
} from './stockMovementTypes';

/**
 * Calculates the current balance for a product
 */
async function calculateBalance(productId: string): Promise<number> {
  const movements = stockMovementStore.getMovementsByProduct(productId);
  return movements.reduce((acc, m) => acc + m.quantityChange, 0);
}

/**
 * @summary
 * Registers a new stock movement.
 * Handles creation, inbound, outbound, adjustment, and deletion logic.
 *
 * @function registerMovement
 * @param {unknown} body - Raw request body
 * @param {string} userId - ID of the user performing the action
 * @returns {Promise<StockMovementEntity>} The created movement
 */
export async function registerMovement(
  body: unknown,
  userId: string
): Promise<StockMovementEntity> {
  const validation = registerMovementSchema.safeParse(body);

  if (!validation.success) {
    throw new ServiceError('VALIDATION_ERROR', 'Validation failed', 400, validation.error.errors);
  }

  const input = validation.data;
  const timestamp = new Date().toISOString();
  const movementId = randomUUID();

  // Handle CREATION
  if (input.movement_type === STOCK_MOVEMENT_TYPES.CREATION) {
    if (stockMovementStore.skuExists(input.product_sku)) {
      throw new ServiceError('BUSINESS_RULE_ERROR', 'SKU already exists', 409);
    }

    const productId = randomUUID();
    const newProduct: ProductEntity = {
      id: productId,
      name: input.product_name,
      sku: input.product_sku,
      description: input.product_description || null,
      unitOfMeasure: input.unit_of_measure,
      status: PRODUCT_STATUS.ACTIVE,
      dateCreated: timestamp,
      dateModified: timestamp,
    };

    stockMovementStore.addProduct(newProduct);

    const movement: StockMovementEntity = {
      id: movementId,
      productId,
      userId,
      type: STOCK_MOVEMENT_TYPES.CREATION,
      quantityChange: input.quantity_change,
      reason: null,
      documentReference: null,
      timestamp,
    };

    stockMovementStore.addMovement(movement);
    return movement;
  }

  // Handle other types (require existing product)
  const product = stockMovementStore.getProduct(input.product_id);
  if (!product) {
    throw new ServiceError('NOT_FOUND', 'Product not found', 404);
  }

  if (product.status === PRODUCT_STATUS.INACTIVE) {
    throw new ServiceError('BUSINESS_RULE_ERROR', 'Product is inactive', 400);
  }

  let quantityChange = 0;
  let reason: string | null = null;
  let documentReference: string | null = null;

  const currentBalance = await calculateBalance(product.id);

  switch (input.movement_type) {
    case STOCK_MOVEMENT_TYPES.INBOUND:
      quantityChange = input.quantity_change;
      documentReference = input.document_reference || null;
      break;

    case STOCK_MOVEMENT_TYPES.OUTBOUND:
      if (currentBalance - input.quantity_change < 0) {
        throw new ServiceError(
          'BUSINESS_RULE_ERROR',
          `Insufficient stock. Current: ${currentBalance}`,
          400
        );
      }
      quantityChange = -input.quantity_change; // Decrement
      documentReference = input.document_reference || null;
      break;

    case STOCK_MOVEMENT_TYPES.ADJUSTMENT:
      if (input.quantity_change < 0 && currentBalance + input.quantity_change < 0) {
        throw new ServiceError(
          'BUSINESS_RULE_ERROR',
          `Adjustment results in negative stock. Current: ${currentBalance}`,
          400
        );
      }
      quantityChange = input.quantity_change;
      reason = input.reason;
      break;

    case STOCK_MOVEMENT_TYPES.DELETION:
      stockMovementStore.updateProductStatus(product.id, PRODUCT_STATUS.INACTIVE);
      quantityChange = 0;
      reason = input.reason;
      break;
  }

  const movement: StockMovementEntity = {
    id: movementId,
    productId: product.id,
    userId,
    type: input.movement_type,
    quantityChange,
    reason,
    documentReference,
    timestamp,
  };

  stockMovementStore.addMovement(movement);
  return movement;
}

/**
 * @summary
 * Gets the current balance for a product.
 */
export async function getProductBalance(productId: string): Promise<StockBalanceResponse> {
  const product = stockMovementStore.getProduct(productId);
  if (!product) {
    throw new ServiceError('NOT_FOUND', 'Product not found', 404);
  }

  const balance = await calculateBalance(productId);

  return {
    productId,
    balance,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * @summary
 * Gets the movement history for a product.
 */
export async function getProductHistory(productId: string): Promise<StockHistoryResponse> {
  const product = stockMovementStore.getProduct(productId);
  if (!product) {
    throw new ServiceError('NOT_FOUND', 'Product not found', 404);
  }

  const movements = stockMovementStore.getMovementsByProduct(productId);

  return {
    movements,
    totalCount: movements.length,
  };
}
