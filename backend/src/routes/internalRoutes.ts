/**
 * @summary
 * Internal API routes configuration.
 * Handles authenticated endpoints for business operations.
 *
 * @module routes/internalRoutes
 */

import { Router } from 'express';
import * as initExampleController from '@/api/internal/init-example/controller';
import * as stockMovementController from '@/api/internal/stock-movement/controller';

const router = Router();

/**
 * @rule {be-route-configuration}
 * Init-Example routes - /api/internal/init-example
 */
router.get('/init-example', initExampleController.listHandler);
router.post('/init-example', initExampleController.createHandler);
router.get('/init-example/:id', initExampleController.getHandler);
router.put('/init-example/:id', initExampleController.updateHandler);
router.delete('/init-example/:id', initExampleController.deleteHandler);

/**
 * @rule {be-route-configuration}
 * Stock Movement routes - /api/internal/stock-movement
 */
router.post('/stock-movement', stockMovementController.registerHandler);
router.get('/stock-movement/product/:id/balance', stockMovementController.balanceHandler);
router.get('/stock-movement/product/:id/history', stockMovementController.historyHandler);

export default router;
