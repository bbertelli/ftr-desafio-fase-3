import { Plus } from "lucide-react";

import { Button, Card } from "../../components/ui";

export function CategoriesPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorias</h1>
          <p className="page-subtitle">Organize suas transações por categorias</p>
        </div>
        <Button leftIcon={<Plus size={16} />}>Nova categoria</Button>
      </div>

      <Card>
        <p className="subtitle">Cards de categorias</p>
        <p className="list-subtitle">
          Próxima etapa: integrar criação, edição, exclusão e listagem de categorias.
        </p>
      </Card>
    </section>
  );
}
