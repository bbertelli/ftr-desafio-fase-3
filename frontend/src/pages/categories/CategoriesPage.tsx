import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Pencil, Plus, Tag as TagIcon, Trash2, UtensilsCrossed } from "lucide-react";

import {
  CREATE_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
  GET_CATEGORIES_QUERY,
  GET_TRANSACTIONS_FOR_CATEGORY_STATS_QUERY,
  UPDATE_CATEGORY_MUTATION,
} from "../../graphql/categories";
import { Button, Card, IconButton, Input, Modal, Tag } from "../../components/ui";

type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type Transaction = {
  id: string;
  amount: number;
  categoryId: string | null;
};

const tagColors = ["blue", "purple", "pink", "orange", "yellow", "green"] as const;

type ModalState =
  | { mode: "create" }
  | {
      mode: "edit";
      category: Category;
    };

export function CategoriesPage() {
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<{ categories: Category[] }>(
    GET_CATEGORIES_QUERY,
  );
  const { data: transactionsData } = useQuery<{ transactions: Transaction[] }>(
    GET_TRANSACTIONS_FOR_CATEGORY_STATS_QUERY,
  );

  const [createCategory, { loading: createLoading }] = useMutation(
    CREATE_CATEGORY_MUTATION,
  );
  const [updateCategory, { loading: updateLoading }] = useMutation(
    UPDATE_CATEGORY_MUTATION,
  );
  const [deleteCategory, { loading: deleteLoading }] = useMutation(
    DELETE_CATEGORY_MUTATION,
  );

  const categories = data?.categories ?? [];
  const transactions = transactionsData?.transactions ?? [];
  const isSubmitting = createLoading || updateLoading;

  const categoryStats = useMemo(() => {
    const transactionCountByCategoryId = transactions.reduce<Record<string, number>>(
      (acc, transaction) => {
        if (!transaction.categoryId) {
          return acc;
        }

        acc[transaction.categoryId] = (acc[transaction.categoryId] ?? 0) + 1;
        return acc;
      },
      {},
    );

    const amountSumByCategoryId = transactions.reduce<Record<string, number>>(
      (acc, transaction) => {
        if (!transaction.categoryId) {
          return acc;
        }

        acc[transaction.categoryId] =
          (acc[transaction.categoryId] ?? 0) + transaction.amount;
        return acc;
      },
      {},
    );

    const sortedByUsage = [...categories].sort(
      (a, b) =>
        (transactionCountByCategoryId[b.id] ?? 0) -
        (transactionCountByCategoryId[a.id] ?? 0),
    );

    return {
      transactionCountByCategoryId,
      amountSumByCategoryId,
      mostUsedCategory: sortedByUsage[0],
      totalTransactions: transactions.filter((transaction) => transaction.categoryId).length,
    };
  }, [categories, transactions]);

  function openCreateModal() {
    setFormError(null);
    setName("");
    setModalState({ mode: "create" });
  }

  function openEditModal(category: Category) {
    setFormError(null);
    setName(category.name);
    setModalState({ mode: "edit", category });
  }

  function closeModal() {
    setModalState(null);
    setName("");
    setFormError(null);
  }

  async function handleSubmit() {
    setFormError(null);

    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError("O título da categoria é obrigatório.");
      return;
    }

    try {
      if (modalState?.mode === "create") {
        await createCategory({
          variables: {
            input: { name: trimmedName },
          },
        });
      } else if (modalState?.mode === "edit") {
        await updateCategory({
          variables: {
            input: { id: modalState.category.id, name: trimmedName },
          },
        });
      }

      await refetch();
      closeModal();
    } catch (mutationError) {
      if (mutationError instanceof Error) {
        setFormError(mutationError.message);
      } else {
        setFormError("Não foi possível salvar a categoria.");
      }
    }
  }

  async function handleDelete(category: Category) {
    const shouldDelete = window.confirm(
      `Tem certeza que deseja excluir a categoria "${category.name}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteCategory({
        variables: {
          id: category.id,
        },
      });

      await refetch();
    } catch {
      setFormError("Não foi possível excluir a categoria.");
    }
  }

  if (loading) {
    return (
      <section className="page">
        <p className="list-subtitle">Carregando categorias...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <p className="auth-error">Erro ao carregar categorias: {error.message}</p>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorias</h1>
          <p className="page-subtitle">Organize suas transações por categorias</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openCreateModal}>
          Nova categoria
        </Button>
      </div>

      <div className="summary-grid">
        <Card>
          <p className="summary-label">
            <TagIcon size={14} /> Total de categorias
          </p>
          <p className="summary-value">{categories.length}</p>
        </Card>
        <Card>
          <p className="summary-label">
            <Plus size={14} /> Total de transações
          </p>
          <p className="summary-value">{categoryStats.totalTransactions}</p>
        </Card>
        <Card>
          <p className="summary-label">
            <UtensilsCrossed size={14} /> Categoria mais utilizada
          </p>
          <p className="summary-value">
            {categoryStats.mostUsedCategory?.name ?? "Sem dados"}
          </p>
        </Card>
      </div>

      <div className="category-grid">
        {categories.map((category, index) => {
          const color = tagColors[index % tagColors.length];
          const itemCount =
            categoryStats.transactionCountByCategoryId[category.id] ?? 0;
          const totalAmount = categoryStats.amountSumByCategoryId[category.id] ?? 0;

          return (
            <Card key={category.id} className="category-card">
              <div className="category-card__header">
                <Tag color={color}>{category.name}</Tag>
                <div className="category-card__actions">
                  <IconButton
                    variant="danger"
                    aria-label={`Excluir ${category.name}`}
                    onClick={() => handleDelete(category)}
                    disabled={deleteLoading}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                  <IconButton
                    aria-label={`Editar ${category.name}`}
                    onClick={() => openEditModal(category)}
                  >
                    <Pencil size={16} />
                  </IconButton>
                </div>
              </div>

              <p className="category-card__title">{category.name}</p>
              <p className="list-subtitle">{itemCount} itens</p>
              <p className="list-amount">
                {totalAmount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={Boolean(modalState)}
        title={modalState?.mode === "edit" ? "Editar categoria" : "Nova categoria"}
        subtitle="Organize suas transações por categorias"
        onClose={closeModal}
      >
        <div className="modal-form">
          <Input
            label="Título"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex. Alimentação"
            required
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
