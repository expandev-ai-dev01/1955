import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DOMPurify from 'dompurify';
import { createProductSchema, unitOfMeasureEnum } from '../../validations/movement';
import type { CreateProductInput, CreateProductOutput } from '../../types';
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
} from '@/core/components/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/select';

function CreateProductForm() {
  const { mutate: register, isPending } = useRegisterMovement();

  const form = useForm<CreateProductInput, any, CreateProductOutput>({
    resolver: zodResolver(createProductSchema),
    mode: 'onBlur',
    defaultValues: {
      movement_type: 'CREATION',
      product_name: '',
      product_sku: '',
      product_description: '',
      unit_of_measure: 'UN',
      quantity_change: 0,
    },
  });

  const onSubmit = (data: CreateProductOutput) => {
    const sanitizedData = {
      ...data,
      product_name: DOMPurify.sanitize(data.product_name),
      product_sku: DOMPurify.sanitize(data.product_sku),
      product_description: data.product_description
        ? DOMPurify.sanitize(data.product_description)
        : undefined,
    };
    register(sanitizedData, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="product_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Produto</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Parafuso Sextavado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product_sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: PAR-SEX-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="product_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalhes do produto..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="unit_of_measure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade de Medida</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {unitOfMeasureEnum.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity_change"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade Inicial</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value as string | number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Cadastrando...' : 'Cadastrar Produto'}
        </Button>
      </form>
    </Form>
  );
}

export { CreateProductForm };
