import { z } from 'zod';
import { createProductSchema, movementSchema } from '../validations/movement';

export type CreateProductInput = z.input<typeof createProductSchema>;
export type CreateProductOutput = z.output<typeof createProductSchema>;

export type MovementInput = z.input<typeof movementSchema>;
export type MovementOutput = z.output<typeof movementSchema>;

export interface StockBalance {
  product_id: string;
  balance: number;
}

export interface StockHistoryItem {
  movement_id: string;
  movement_type: string;
  quantity_change: number;
  timestamp: string;
  user_id: string;
}
