/**
 * @summary
 * API controller for Stock Movement feature.
 * Handles registration of movements and balance inquiries.
 *
 * @module api/internal/stock-movement/controller
 */

import { Request, Response, NextFunction } from 'express';
import { successResponse, errorResponse, isServiceError } from '@/utils';
import { registerMovement, getProductBalance, getProductHistory } from '@/services/stockMovement';

/**
 * @api {post} /api/internal/stock-movement Register Movement
 * @apiName RegisterStockMovement
 * @apiGroup StockMovement
 *
 * @apiBody {String} movement_type Type (CREATION, INBOUND, OUTBOUND, ADJUSTMENT, DELETION)
 * @apiBody {Object} ...params Type-specific parameters
 */
export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Mock user ID (in real app, get from req.user)
    const userId = '00000000-0000-0000-0000-000000000000';
    const data = await registerMovement(req.body, userId);
    res.status(201).json(successResponse(data));
  } catch (error) {
    if (isServiceError(error)) {
      res.status(error.statusCode).json(errorResponse(error.message, error.code, error.details));
      return;
    }
    next(error);
  }
}

/**
 * @api {get} /api/internal/stock-movement/product/:id/balance Get Balance
 * @apiName GetProductBalance
 * @apiGroup StockMovement
 */
export async function balanceHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await getProductBalance(req.params.id);
    res.json(successResponse(data));
  } catch (error) {
    if (isServiceError(error)) {
      res.status(error.statusCode).json(errorResponse(error.message, error.code, error.details));
      return;
    }
    next(error);
  }
}

/**
 * @api {get} /api/internal/stock-movement/product/:id/history Get History
 * @apiName GetProductHistory
 * @apiGroup StockMovement
 */
export async function historyHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await getProductHistory(req.params.id);
    res.json(successResponse(data));
  } catch (error) {
    if (isServiceError(error)) {
      res.status(error.statusCode).json(errorResponse(error.message, error.code, error.details));
      return;
    }
    next(error);
  }
}
