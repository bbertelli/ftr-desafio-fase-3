import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import {
  ArrowRight,
  CircleArrowDown,
  CircleArrowUp,
  Plus,
  Wallet2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { GET_TRANSACTIONS_QUERY } from "../../graphql/transactions";
import { Button, Card, Tag } from "../../components/ui";
import { CategoryIcon } from "../../utils/categoryVisual";

type TransactionType = "INCOME" | "EXPENSE";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    icon: string;
    color: "blue" | "purple" | "pink" | "orange" | "yellow" | "green" | "red";
  } | null;
};

type CategorySummary = {
  id: string;
  label: string;
  items: number;
  value: number;
  color: "blue" | "purple" | "pink" | "orange" | "yellow" | "green";
};

const tagColors: CategorySummary["color"][] = [
  "blue",
  "purple",
  "pink",
  "orange",
  "yellow",
  "green",
];

function formatIsoDateToBr(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery<{ transactions: Transaction[] }>(
    GET_TRANSACTIONS_QUERY,
  );

  const transactions = data?.transactions ?? [];

  const { incomeTotal, expenseTotal, balance, recentTransactions, categories } = useMemo(() => {
    const totals = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "INCOME") {
          acc.incomeTotal += transaction.amount;
        } else {
          acc.expenseTotal += transaction.amount;
        }

        return acc;
      },
      { incomeTotal: 0, expenseTotal: 0 },
    );

    const usageByCategory = transactions.reduce<
      Record<
        string,
        {
          id: string;
          label: string;
          items: number;
          value: number;
        }
      >
    >((acc, transaction) => {
      if (!transaction.categoryId || !transaction.category) {
        return acc;
      }

      const current = acc[transaction.categoryId] ?? {
        id: transaction.categoryId,
        label: transaction.category.name,
        items: 0,
        value: 0,
      };

      current.items += 1;
      current.value += transaction.amount;
      acc[transaction.categoryId] = current;

      return acc;
    }, {});

    const topCategories = Object.values(usageByCategory)
      .sort((a, b) => b.items - a.items)
      .slice(0, 4)
      .map((category, index) => ({
        ...category,
        color: tagColors[index % tagColors.length],
      }));

    return {
      incomeTotal: totals.incomeTotal,
      expenseTotal: totals.expenseTotal,
      balance: totals.incomeTotal - totals.expenseTotal,
      recentTransactions: transactions.slice(0, 5),
      categories: topCategories,
    };
  }, [transactions]);

  if (loading) {
    return (
      <section className="page">
        <p className="list-subtitle">Carregando dashboard...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <p className="auth-error">Erro ao carregar dashboard: {error.message}</p>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="summary-grid">
        <Card>
          <p className="summary-label">
            <Wallet2 size={14} className="summary-icon summary-icon--purple" /> Saldo total
          </p>
          <p className="summary-value">
            {balance.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </Card>
        <Card>
          <p className="summary-label">
            <CircleArrowUp size={14} className="summary-icon summary-icon--green" /> Receitas do mês
          </p>
          <p className="summary-value">
            {incomeTotal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </Card>
        <Card>
          <p className="summary-label">
            <CircleArrowDown size={14} className="summary-icon summary-icon--red" /> Despesas do mês
          </p>
          <p className="summary-value">
            {expenseTotal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </Card>
      </div>

      <div className="dashboard-grid">
        <Card
          title="Transações recentes"
          subtitle={
            <Link to="/transactions" className="card-link">
              Ver todas <ArrowRight size={14} />
            </Link>
          }
        >
          <div className="list">
            {recentTransactions.length === 0 ? (
              <p className="list-subtitle">Ainda não existem transações cadastradas.</p>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="dashboard-transaction-row">
                  <div
                    className={`dashboard-category-icon dashboard-category-icon--${
                      transaction.category?.color ?? "yellow"
                    }`}
                  >
                    <CategoryIcon icon={transaction.category?.icon} />
                  </div>
                  <div>
                    <p className="list-title">{transaction.title}</p>
                    <p className="list-subtitle">{formatIsoDateToBr(transaction.date)}</p>
                  </div>
                  <Tag color={transaction.category?.color ?? "yellow"}>
                    {transaction.category?.name ?? "Sem categoria"}
                  </Tag>
                  <p className="list-amount">
                    {transaction.amount.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                  <span
                    className={`type-indicator${
                      transaction.type === "INCOME" ? " type-indicator--income" : ""
                    }`}
                  >
                    {transaction.type === "INCOME" ? (
                      <CircleArrowUp size={18} />
                    ) : (
                      <CircleArrowDown size={18} />
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="dashboard-add-transaction">
            <Button
              variant="ghost"
              leftIcon={<Plus size={16} />}
              onClick={() => navigate("/transactions?new=1")}
            >
              Nova transação
            </Button>
          </div>
        </Card>

        <Card
          title="Categorias"
          subtitle={
            <Link to="/categories" className="card-link">
              Gerenciar <ArrowRight size={14} />
            </Link>
          }
        >
          <div className="list">
            {categories.length === 0 ? (
              <p className="list-subtitle">
                Ainda não existem categorias associadas a transações.
              </p>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="dashboard-category-row">
                  <Tag color={category.color}>{category.label}</Tag>
                  <p className="list-subtitle">{category.items} itens</p>
                  <p className="list-amount">
                    {category.value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
