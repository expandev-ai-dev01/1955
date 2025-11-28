import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DOMPurify from 'dompurify';
import { movementSchema, movementTypeEnum } from '../../validations/movement';
import type { MovementInput, MovementOutput } from '../../types';
import { useRegisterMovement } from '../../hooks/useStockMovement';
import { Button } from '@/core/components/button';
import { Input } from '@/core/components/input';
import { Textarea } from '@/core/components/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/core/components/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/select';

function MovementForm() {
  const { mutate: register, isPending } = useRegisterMovement();

  const form = useForm<MovementInput, any, MovementOutput>({
    resolver: zodResolver(movementSchema),
    mode: 'onBlur',
    defaultValues: {
      product_id: '',
      movement_type: 'INBOUND',
      quantity_change: 0,
      document_reference: '',
      reason: '',
    },
  });

  const movementType = form.watch('movement_type');
  const isDeletion = movementType === 'DELETION';
  const isAdjustment = movementType === 'ADJUSTMENT';
  const isInOut = movementType === 'INBOUND' || movementType === 'OUTBOUND';

  const onSubmit = (data: MovementOutput) => {
    const sanitizedData = {
      ...data,
      document_reference: data.document_reference
        ? DOMPurify.sanitize(data.document_reference)
        : undefined,
      reason: data.reason ? DOMPurify.sanitize(data.reason) : undefined,
      quantity_change: isDeletion ? 0 : data.quantity_change,
    };
    register(sanitizedData, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="product_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID do Produto</FormLabel>
              <FormControl>
                <Input placeholder="UUID do produto" {...field} />
              </FormControl>
              <FormDescription>Cole o ID do produto que deseja movimentar.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="movement_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Movimentação</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {movementTypeEnum.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isDeletion && (
            <FormField
              control={form.control}
              name="quantity_change"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      value={field.value as string | number}
                    />
                  </FormControl>
                  <FormDescription>
                    {isAdjustment
                      ? 'Use valores negativos para reduzir estoque.'
                      : 'Valor deve ser positivo.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {isInOut && (
          <FormField
            control={form.control}
            name="document_reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referência Documental</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: NF-12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(isAdjustment || isDeletion) && (
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Justificativa</FormLabel>
                <FormControl>
                  <Textarea placeholder="Motivo da operação..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          className="w-full"
          variant={isDeletion ? 'destructive' : 'default'}
          disabled={isPending}
        >
          {isPending ? 'Processando...' : 'Registrar Movimentação'}
        </Button>
      </form>
    </Form>
  );
}

export { MovementForm };
