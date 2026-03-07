import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  ArrowDownUp,
  CircleArrowDown,
  CircleArrowUp,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet2,
} from "lucide-react";

import { GET_CATEGORIES_QUERY } from "../../graphql/categories";
import {
  CREATE_TRANSACTION_MUTATION,
  DELETE_TRANSACTION_MUTATION,
  GET_TRANSACTIONS_QUERY,
  UPDATE_TRANSACTION_MUTATION,
} from "../../graphql/transactions";
import {
  Button,
  Card,
  IconButton,
  Input,
  Modal,
  Select,
  Tag,
  TypeBadge,
} from "../../components/ui";

type Category = {
  id: string;
  name: string;
};

type TransactionType = "INCOME" | "EXPENSE";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: string;
  notes: string | null;
  categoryId: string | null;
  category: Category | null;
};

type ModalState =
  | { mode: "create" }
  | {
      mode: "edit";
      transaction: Transaction;
    };

const categoryTagColors = ["blue", "purple", "pink", "orange", "yellow", "green"] as const;

function formatIsoDateToBr(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export function TransactionsPage() {
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | TransactionType>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const {
    data: transactionsData,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery<{ transactions: Transaction[] }>(GET_TRANSACTIONS_QUERY);
  const { data: categoriesData } = useQuery<{ categories: Category[] }>(
    GET_CATEGORIES_QUERY,
  );

  const [createTransaction, { loading: createLoading }] = useMutation(
    CREATE_TRANSACTION_MUTATION,
  );
  const [updateTransaction, { loading: updateLoading }] = useMutation(
    UPDATE_TRANSACTION_MUTATION,
  );
  const [deleteTransaction, { loading: deleteLoading }] = useMutation(
    DELETE_TRANSACTION_MUTATION,
  );

  const categories = categoriesData?.categories ?? [];
  const transactions = transactionsData?.transactions ?? [];
  const isSubmitting = createLoading || updateLoading;

  const categoryColorMap = useMemo(() => {
    return categories.reduce<Record<string, (typeof categoryTagColors)[number]>>(
      (acc, category, index) => {
        acc[category.id] = categoryTagColors[index % categoryTagColors.length];
        return acc;
      },
      {},
    );
  }, [categories]);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !normalizedSearch ||
        transaction.title.toLowerCase().includes(normalizedSearch) ||
        transaction.notes?.toLowerCase().includes(normalizedSearch) ||
        transaction.category?.name.toLowerCase().includes(normalizedSearch);
      const matchesType = typeFilter === "ALL" || transaction.type === typeFilter;
      const matchesCategory =
        categoryFilter === "ALL" || transaction.categoryId === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [categoryFilter, search, transactions, typeFilter]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "INCOME") {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }

        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [transactions]);

  const balance = totals.income - totals.expense;

  function resetForm() {
    setTitle("");
    setAmount("");
    setType("EXPENSE");
    setDate("");
    setNotes("");
    setCategoryId("");
    setFormError(null);
  }

  function openCreateModal() {
    resetForm();
    setModalState({ mode: "create" });
  }

  function openEditModal(transaction: Transaction) {
    setFormError(null);
    setTitle(transaction.title);
    setAmount(String(transaction.amount));
    setType(transaction.type);
    setDate(transaction.date.slice(0, 10));
    setNotes(transaction.notes ?? "");
    setCategoryId(transaction.categoryId ?? "");
    setModalState({ mode: "edit", transaction });
  }

  function closeModal() {
    setModalState(null);
    resetForm();
  }

  async function handleSubmit() {
    setFormError(null);

    const trimmedTitle = title.trim();
    const parsedAmount = Number(amount);

    if (!trimmedTitle) {
      setFormError("O título da transação é obrigatório.");
      return;
    }

    if (!amount || Number.isNaN(parsedAmount)) {
      setFormError("Informe um valor numérico válido.");
      return;
    }

    if (!date) {
      setFormError("Selecione uma data para a transação.");
      return;
    }

    try {
      const input = {
        title: trimmedTitle,
        amount: parsedAmount,
        type,
        date: `${date}T12:00:00.000Z`,
        notes: notes.trim() ? notes.trim() : null,
        categoryId: categoryId || null,
      };

      if (modalState?.mode === "create") {
        await createTransaction({
          variables: { input },
        });
      } else if (modalState?.mode === "edit") {
        await updateTransaction({
          variables: {
            input: {
              id: modalState.transaction.id,
              ...input,
            },
          },
        });
      }

      await refetchTransactions();
      closeModal();
    } catch (mutationError) {
      if (mutationError instanceof Error) {
        setFormError(mutationError.message);
      } else {
        setFormError("Não foi possível salvar a transação.");
      }
    }
  }

  async function handleDelete(transaction: Transaction) {
    const shouldDelete = window.confirm(
      `Tem certeza que deseja excluir a transação "${transaction.title}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteTransaction({
        variables: {
          id: transaction.id,
        },
      });
      await refetchTransactions();
    } catch {
      setFormError("Não foi possível excluir a transação.");
    }
  }

  if (transactionsLoading) {
    return (
      <section className="page">
        <p className="list-subtitle">Carregando transações...</p>
      </section>
    );
  }

  if (transactionsError) {
    return (
      <section className="page">
        <p className="auth-error">
          Erro ao carregar transações: {transactionsError.message}
        </p>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transações</h1>
          <p className="page-subtitle">Gerencie todas as suas transações financeiras</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openCreateModal}>
          Nova transação
        </Button>
      </div>

      <div className="summary-grid">
        <Card>
          <p className="summary-label">
            <Wallet2 size={14} /> Saldo total
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
            <CircleArrowUp size={14} /> Total de receitas
          </p>
          <p className="summary-value">
            {totals.income.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </Card>
        <Card>
          <p className="summary-label">
            <CircleArrowDown size={14} /> Total de despesas
          </p>
          <p className="summary-value">
            {totals.expense.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </Card>
      </div>

      <Card title="Lista de transações" subtitle={`${filteredTransactions.length} itens`}>
        <div className="transactions-filters">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título, notas ou categoria"
            leftIcon={<Search size={16} />}
          />
          <Select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as "ALL" | TransactionType)}
            leftIcon={<ArrowDownUp size={16} />}
            options={[
              { label: "Todos os tipos", value: "ALL" },
              { label: "Entrada", value: "INCOME" },
              { label: "Saída", value: "EXPENSE" },
            ]}
          />
          <Select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            options={[
              { label: "Todas as categorias", value: "ALL" },
              ...categories.map((category) => ({
                label: category.name,
                value: category.id,
              })),
            ]}
          />
        </div>

        <div className="transactions-list">
          {filteredTransactions.length === 0 ? (
            <p className="list-subtitle">Nenhuma transação encontrada com os filtros atuais.</p>
          ) : (
            filteredTransactions.map((transaction) => {
              const categoryName = transaction.category?.name ?? "Sem categoria";
              const categoryColor = transaction.categoryId
                ? categoryColorMap[transaction.categoryId] ?? "blue"
                : "yellow";
              const formattedAmount = transaction.amount.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              });
              const formattedDate = formatIsoDateToBr(transaction.date);

              return (
                <div key={transaction.id} className="transactions-row">
                  <div>
                    <p className="list-title">{transaction.title}</p>
                    <p className="list-subtitle">{formattedDate}</p>
                    {transaction.notes ? (
                      <p className="transactions-row__notes">{transaction.notes}</p>
                    ) : null}
                  </div>

                  <Tag color={categoryColor}>{categoryName}</Tag>

                  <div className="transactions-row__amount">
                    <p className="list-amount">
                      {transaction.type === "INCOME" ? "+ " : "- "}
                      {formattedAmount}
                    </p>
                    <TypeBadge type={transaction.type} />
                  </div>

                  <div className="transactions-row__actions">
                    <IconButton
                      aria-label={`Editar ${transaction.title}`}
                      onClick={() => openEditModal(transaction)}
                    >
                      <Pencil size={16} />
                    </IconButton>
                    <IconButton
                      variant="danger"
                      aria-label={`Excluir ${transaction.title}`}
                      onClick={() => handleDelete(transaction)}
                      disabled={deleteLoading}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Modal
        isOpen={Boolean(modalState)}
        title={modalState?.mode === "edit" ? "Editar transação" : "Nova transação"}
        subtitle="Preencha os dados para salvar sua transação"
        onClose={closeModal}
      >
        <div className="modal-form">
          <Input
            label="Título"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex. Jantar no restaurante"
            required
          />
          <div className="transactions-modal-grid">
            <Input
              label="Valor"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0,00"
              required
            />
            <Select
              label="Tipo"
              value={type}
              onChange={(event) => setType(event.target.value as TransactionType)}
              options={[
                { label: "Entrada", value: "INCOME" },
                { label: "Saída", value: "EXPENSE" },
              ]}
            />
          </div>
          <div className="transactions-modal-grid">
            <Input
              label="Data"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
            <Select
              label="Categoria"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              options={[
                { label: "Sem categoria", value: "" },
                ...categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                })),
              ]}
            />
          </div>
          <Input
            label="Notas"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Observações (opcional)"
          />

          {formError ? <p className="auth-error">{formError}</p> : null}

          <Button fullWidth onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
