import { ArrowRight, CircleArrowDown, CircleArrowUp, Plus, Wallet2 } from "lucide-react";

import { Button, Card, Tag, TypeBadge } from "../../components/ui";

const recentTransactions = [
  { id: "1", title: "Pagamento de Salário", date: "01/12/25", amount: "+ R$ 4.250,00", type: "INCOME" as const, tag: "Salário", color: "green" as const },
  { id: "2", title: "Jantar no Restaurante", date: "30/11/25", amount: "- R$ 89,50", type: "EXPENSE" as const, tag: "Alimentação", color: "blue" as const },
  { id: "3", title: "Posto de Gasolina", date: "29/11/25", amount: "- R$ 100,00", type: "EXPENSE" as const, tag: "Transporte", color: "purple" as const },
];

const categories = [
  { id: "1", label: "Alimentação", items: 12, value: "R$ 543,20", color: "blue" as const },
  { id: "2", label: "Transporte", items: 8, value: "R$ 385,50", color: "purple" as const },
  { id: "3", label: "Mercado", items: 3, value: "R$ 298,75", color: "orange" as const },
  { id: "4", label: "Entretenimento", items: 2, value: "R$ 186,20", color: "pink" as const },
];

export function DashboardPage() {
  return (
    <section className="page">
      <div className="summary-grid">
        <Card>
          <p className="summary-label">
            <Wallet2 size={14} /> Saldo total
          </p>
          <p className="summary-value">R$ 12.847,32</p>
        </Card>
        <Card>
          <p className="summary-label">
            <CircleArrowUp size={14} /> Receitas do mês
          </p>
          <p className="summary-value">R$ 4.250,00</p>
        </Card>
        <Card>
          <p className="summary-label">
            <CircleArrowDown size={14} /> Despesas do mês
          </p>
          <p className="summary-value">R$ 2.180,45</p>
        </Card>
      </div>

      <div className="dashboard-grid">
        <Card
          title="Transações recentes"
          subtitle={
            <span className="card-link">
              Ver todas <ArrowRight size={14} />
            </span>
          }
        >
          <div className="list">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="list-row">
                <div>
                  <p className="list-title">{transaction.title}</p>
                  <p className="list-subtitle">{transaction.date}</p>
                </div>
                <Tag color={transaction.color}>{transaction.tag}</Tag>
                <p className="list-amount">{transaction.amount}</p>
                <TypeBadge type={transaction.type} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <Button fullWidth leftIcon={<Plus size={16} />}>
              Nova transação
            </Button>
          </div>
        </Card>

        <Card
          title="Categorias"
          subtitle={
            <span className="card-link">
              Gerenciar <ArrowRight size={14} />
            </span>
          }
        >
          <div className="list">
            {categories.map((category) => (
              <div key={category.id} className="list-row">
                <Tag color={category.color}>{category.label}</Tag>
                <p className="list-subtitle">{category.items} itens</p>
                <p className="list-amount">{category.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
