/**
 * @summary
 * In-memory store for Stock Movement feature.
 * Simulates database tables for Products and Movements.
 *
 * @module instances/stockMovement/stockMovementStore
 */

import { ProductEntity, StockMovementEntity } from '@/services/stockMovement/stockMovementTypes';

class StockMovementStore {
  // Map<ProductId, ProductEntity>
  private products: Map<string, ProductEntity> = new Map();

  // Map<SKU, ProductId> for fast uniqueness check
  private skuIndex: Map<string, string> = new Map();

  // Array of movements
  private movements: StockMovementEntity[] = [];

  /**
   * Add a new product
   */
  addProduct(product: ProductEntity): void {
    if (this.skuIndex.has(product.sku)) {
      throw new Error('SKU already exists');
    }
    this.products.set(product.id, product);
    this.skuIndex.set(product.sku, product.id);
  }

  /**
   * Get product by ID
   */
  getProduct(id: string): ProductEntity | undefined {
    return this.products.get(id);
  }

  /**
   * Check if SKU exists (globally)
   */
  skuExists(sku: string): boolean {
    return this.skuIndex.has(sku);
  }

  /**
   * Update product status
   */
  updateProductStatus(id: string, status: ProductEntity['status']): void {
    const product = this.products.get(id);
    if (product) {
      product.status = status;
      product.dateModified = new Date().toISOString();
      this.products.set(id, product);
    }
  }

  /**
   * Add a movement
   */
  addMovement(movement: StockMovementEntity): void {
    this.movements.push(movement);
  }

  /**
   * Get movements for a product
   */
  getMovementsByProduct(productId: string): StockMovementEntity[] {
    return this.movements.filter((m) => m.productId === productId);
  }

  /**
   * Clear store (for testing)
   */
  clear(): void {
    this.products.clear();
    this.skuIndex.clear();
    this.movements = [];
  }
}

export const stockMovementStore = new StockMovementStore();
