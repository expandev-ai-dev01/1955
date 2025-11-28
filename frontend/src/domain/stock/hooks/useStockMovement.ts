import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stockService } from '../services/stockService';
import { toast } from 'sonner';

export const useRegisterMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stockService.registerMovement,
    onSuccess: (_, variables) => {
      toast.success('Movimentação registrada com sucesso!');
      if ('product_id' in variables) {
        queryClient.invalidateQueries({ queryKey: ['stock', 'balance', variables.product_id] });
        queryClient.invalidateQueries({ queryKey: ['stock', 'history', variables.product_id] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar movimentação');
    },
  });
};

export const useProductBalance = (productId: string) => {
  return useQuery({
    queryKey: ['stock', 'balance', productId],
    queryFn: () => stockService.getBalance(productId),
    enabled: !!productId && productId.length > 0,
  });
};

export const useProductHistory = (productId: string) => {
  return useQuery({
    queryKey: ['stock', 'history', productId],
    queryFn: () => stockService.getHistory(productId),
    enabled: !!productId && productId.length > 0,
  });
};
