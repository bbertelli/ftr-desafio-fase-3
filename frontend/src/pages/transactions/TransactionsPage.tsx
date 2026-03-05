import { Plus } from "lucide-react";

import { Button, Card } from "../../components/ui";

export function TransactionsPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transações</h1>
          <p className="page-subtitle">Gerencie todas as suas transações financeiras</p>
        </div>
        <Button leftIcon={<Plus size={16} />}>Nova transação</Button>
      </div>

      <Card>
        <p className="subtitle">Tabela de transações</p>
        <p className="list-subtitle">
          Próxima etapa: integrar filtros e listagem completa com GraphQL.
        </p>
      </Card>
    </section>
  );
}
