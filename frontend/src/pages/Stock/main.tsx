import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/card';
import { CreateProductForm } from '@/domain/stock/components/CreateProductForm';
import { MovementForm } from '@/domain/stock/components/MovementForm';

function StockPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Estoque</h1>
        <p className="text-muted-foreground">
          Gerencie produtos e registre movimentações de entrada, saída e ajustes.
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Novo Produto</TabsTrigger>
          <TabsTrigger value="movement">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar Novo Produto</CardTitle>
              <CardDescription>
                Adicione um novo item ao catálogo e defina seu estoque inicial.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateProductForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movement">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Movimentação</CardTitle>
              <CardDescription>
                Entradas, saídas, ajustes de inventário ou exclusão de produtos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MovementForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { StockPage };
