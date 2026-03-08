import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  ArrowDownUp,
  CircleArrowDown,
  CircleArrowUp,
  Pencil,
  Plus,
  Search,
  Trash2,
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
} from "../../components/ui";
import { CategoryIcon } from "../../utils/categoryVisual";
import { useSearchParams } from "react-router-dom";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: "blue" | "purple" | "pink" | "orange" | "yellow" | "green" | "red";
};

type TransactionType = "INCOME" | "EXPENSE";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string | null;
  category: Category | null;
};

type ModalState =
  | { mode: "create" }
  | {
      mode: "edit";
      transaction: Transaction;
    };

function formatIsoDateToBr(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | TransactionType>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [periodFilter, setPeriodFilter] = useState<"ALL" | "MONTH" | "YEAR">("ALL");
  const [formError, setFormError] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [date, setDate] = useState("");
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

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !normalizedSearch ||
        transaction.title.toLowerCase().includes(normalizedSearch) ||
        transaction.category?.name.toLowerCase().includes(normalizedSearch);
      const matchesType = typeFilter === "ALL" || transaction.type === typeFilter;
      const matchesCategory =
        categoryFilter === "ALL" || transaction.categoryId === categoryFilter;
      const transactionDate = new Date(transaction.date);
      const now = new Date();
      const matchesPeriod =
        periodFilter === "ALL" ||
        (periodFilter === "MONTH" &&
          transactionDate.getUTCMonth() === now.getUTCMonth() &&
          transactionDate.getUTCFullYear() === now.getUTCFullYear()) ||
        (periodFilter === "YEAR" &&
          transactionDate.getUTCFullYear() === now.getUTCFullYear());

      return matchesSearch && matchesType && matchesCategory && matchesPeriod;
    });
  }, [categoryFilter, periodFilter, search, transactions, typeFilter]);

  function resetForm() {
    setDescription("");
    setAmount("");
    setType("EXPENSE");
    setDate("");
    setCategoryId("");
    setFormError(null);
  }

  function openCreateModal() {
    resetForm();
    setModalState({ mode: "create" });
  }

  function openEditModal(transaction: Transaction) {
    setFormError(null);
    setDescription(transaction.title);
    setAmount(String(transaction.amount));
    setType(transaction.type);
    setDate(transaction.date.slice(0, 10));
    setCategoryId(transaction.categoryId ?? "");
    setModalState({ mode: "edit", transaction });
  }

  function closeModal() {
    setModalState(null);
    resetForm();
  }

  useEffect(() => {
    if (searchParams.get("new") !== "1") {
      return;
    }

    resetForm();
    setModalState({ mode: "create" });
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("new");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  async function handleSubmit() {
    setFormError(null);

    const trimmedDescription = description.trim();
    const parsedAmount = Number(amount);

    if (!trimmedDescription) {
      setFormError("A descrição da transação é obrigatória.");
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
        title: trimmedDescription,
        amount: parsedAmount,
        type,
        date: `${date}T12:00:00.000Z`,
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

      <Card title="Filtros">
        <div className="transactions-filters">
          <Input
            label="Buscar"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por descrição ou categoria"
            leftIcon={<Search size={16} />}
          />
          <Select
            label="Tipo"
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
            label="Categoria"
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
          <Select
            label="Período"
            value={periodFilter}
            onChange={(event) =>
              setPeriodFilter(event.target.value as "ALL" | "MONTH" | "YEAR")
            }
            options={[
              { label: "Todo período", value: "ALL" },
              { label: "Mês atual", value: "MONTH" },
              { label: "Ano atual", value: "YEAR" },
            ]}
          />
        </div>
      </Card>

      <Card title="Lista de transações" subtitle={`${filteredTransactions.length} itens`}>
        <div className="transactions-list">
          {filteredTransactions.length === 0 ? (
            <p className="list-subtitle">Nenhuma transação encontrada com os filtros atuais.</p>
          ) : (
            filteredTransactions.map((transaction) => {
              const categoryName = transaction.category?.name ?? "Sem categoria";
              const categoryColor = transaction.category?.color ?? "yellow";
              const formattedAmount = transaction.amount.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              });
              const formattedDate = formatIsoDateToBr(transaction.date);

              return (
                <div key={transaction.id} className="transactions-row">
                  <div className={`dashboard-category-icon dashboard-category-icon--${categoryColor}`}>
                    <CategoryIcon icon={transaction.category?.icon} />
                  </div>
                  <div>
                    <p className="list-title">{transaction.title}</p>
                    <p className="list-subtitle">{formattedDate}</p>
                  </div>

                  <Tag color={categoryColor}>{categoryName}</Tag>

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

                  <p className="list-amount">{formattedAmount}</p>

                  <IconButton
                    variant="danger"
                    aria-label={`Excluir ${transaction.title}`}
                    onClick={() => handleDelete(transaction)}
                    disabled={deleteLoading}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                  <IconButton
                    aria-label={`Editar ${transaction.title}`}
                    onClick={() => openEditModal(transaction)}
                  >
                    <Pencil size={16} />
                  </IconButton>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Modal
        isOpen={Boolean(modalState)}
        title={modalState?.mode === "edit" ? "Editar transação" : "Nova transação"}
        subtitle="Registre sua despesa ou receita"
        onClose={closeModal}
      >
        <div className="modal-form">
          <Input
            label="Descrição"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex. Jantar no restaurante"
            required
          />
          <div className="transactions-type-toggle">
            <span className="ui-field__label">Tipo</span>
            <div className="transactions-type-toggle__buttons">
              <button
                type="button"
                className={`transactions-type-option transactions-type-option--expense${
                  type === "EXPENSE" ? " transactions-type-option--active" : ""
                }`}
                onClick={() => setType("EXPENSE")}
              >
                <CircleArrowDown size={16} />
                Saída
              </button>
              <button
                type="button"
                className={`transactions-type-option transactions-type-option--income${
                  type === "INCOME" ? " transactions-type-option--active" : ""
                }`}
                onClick={() => setType("INCOME")}
              >
                <CircleArrowUp size={16} />
                Entrada
              </button>
            </div>
          </div>
          <div className="transactions-modal-grid">
            <Input
              label="Data"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
            <Input
              label="Valor"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0,00"
              required
            />
          </div>
          <div>
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

          {formError ? <p className="auth-error">{formError}</p> : null}

          <Button fullWidth onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
