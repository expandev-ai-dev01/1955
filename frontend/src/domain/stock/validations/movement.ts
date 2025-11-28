import { z } from 'zod';

export const unitOfMeasureEnum = ['UN', 'CX', 'KG', 'L', 'M'] as const;
export const movementTypeEnum = ['INBOUND', 'OUTBOUND', 'ADJUSTMENT', 'DELETION'] as const;

export const createProductSchema = z.object({
  movement_type: z.literal('CREATION').default('CREATION'),
  product_name: z
    .string('Nome é obrigatório')
    .min(3, 'Mínimo de 3 caracteres')
    .max(100, 'Máximo de 100 caracteres'),
  product_sku: z
    .string('SKU é obrigatório')
    .regex(/^[a-zA-Z0-9-]+$/, 'Apenas letras, números e hífen'),
  product_description: z.string().max(500, 'Máximo de 500 caracteres').optional(),
  unit_of_measure: z.enum(unitOfMeasureEnum, 'Selecione uma unidade válida'),
  quantity_change: z.coerce
    .number('Quantidade inválida')
    .min(0, 'A quantidade inicial não pode ser negativa'),
});

export const movementSchema = z
  .object({
    product_id: z.string('ID do produto é obrigatório').uuid('ID inválido'),
    movement_type: z.enum(movementTypeEnum, 'Selecione um tipo de movimentação'),
    quantity_change: z.coerce.number('Quantidade inválida').default(0),
    document_reference: z.string().max(50, 'Máximo de 50 caracteres').optional(),
    reason: z.string().max(200, 'Máximo de 200 caracteres').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.movement_type === 'INBOUND' || data.movement_type === 'OUTBOUND') {
      if (data.quantity_change <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Quantidade deve ser maior que zero',
          path: ['quantity_change'],
        });
      }
    }
    if (data.movement_type === 'ADJUSTMENT') {
      if (data.quantity_change === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Quantidade não pode ser zero',
          path: ['quantity_change'],
        });
      }
      if (!data.reason || data.reason.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Justificativa deve ter no mínimo 10 caracteres',
          path: ['reason'],
        });
      }
    }
    if (data.movement_type === 'DELETION') {
      if (!data.reason || data.reason.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Justificativa deve ter no mínimo 10 caracteres',
          path: ['reason'],
        });
      }
    }
  });
