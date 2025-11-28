import { authenticatedClient } from '@/core/lib/api';
import type { CreateProductOutput, MovementOutput, StockBalance, StockHistoryItem } from '../types';

export const stockService = {
  async registerMovement(data: CreateProductOutput | MovementOutput) {
    const response = await authenticatedClient.post('/stock-movement', data);
    return response.data.data;
  },

  async getBalance(productId: string): Promise<StockBalance> {
    const response = await authenticatedClient.get(`/stock-movement/product/${productId}/balance`);
    return response.data.data;
  },

  async getHistory(productId: string): Promise<StockHistoryItem[]> {
    const response = await authenticatedClient.get(`/stock-movement/product/${productId}/history`);
    return response.data.data;
  },
};
