import "./App.css"
import {
  ArrowRight,
  CalendarDays,
  Eye,
  EyeOff,
  Mail,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  Button,
  Card,
  IconButton,
  Input,
  Modal,
  PaginationButton,
  Select,
  Tag,
  TypeBadge,
} from "./components/ui";

function App() {
  const palette = [
    { label: "brand-dark", color: "var(--brand-dark)" },
    { label: "brand-base", color: "var(--brand-base)" },
    { label: "brand-light", color: "var(--brand-light)" },
    { label: "gray-900", color: "var(--gray-900)" },
    { label: "gray-500", color: "var(--gray-500)" },
    { label: "gray-200", color: "var(--gray-200)" },
    { label: "danger", color: "var(--danger)" },
    { label: "success", color: "var(--success)" },
    { label: "blue-base", color: "var(--blue-base)" },
    { label: "purple-base", color: "var(--purple-base)" },
    { label: "pink-base", color: "var(--pink-base)" },
    { label: "orange-base", color: "var(--orange-base)" },
    { label: "yellow-base", color: "var(--yellow-base)" },
    { label: "green-base", color: "var(--green-base)" },
  ];

  return (
    <main className="app">
      <h1 className="section-title">Financy UI Foundation</h1>

      <Card title="Global tokens loaded from Style Guide">
        <p className="subtitle">Core palette used by the components.</p>
        <p className="subtitle">Global tokens loaded from Style Guide</p>
        <div className="swatches">
          {palette.map((item) => (
            <div className="swatch" key={item.label}>
              <div
                className="swatch-color"
                style={{ backgroundColor: item.color }}
              />
              <span className="swatch-label">{item.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="app-grid">
        <Card title="Inputs and Select">
          <div className="ui-field-group">
            <Input label="E-mail" placeholder="mail@exemplo.com" leftIcon={<Mail size={16} />} />
            <Input
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
              leftIcon={<Eye size={16} />}
              rightIcon={<EyeOff size={16} />}
            />
          </div>
          <hr className="demo-divider" />
          <Select
            label="Categoria"
            leftIcon={<Search size={16} />}
            options={[
              { label: "Todas", value: "all" },
              { label: "Alimentação", value: "food" },
              { label: "Transporte", value: "transport" },
            ]}
          />
        </Card>

        <Card title="Buttons and IconButtons">
          <div className="button-row">
            <Button leftIcon={<Plus size={16} />}>Nova transação</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button rightIcon={<ArrowRight size={16} />}>Continuar</Button>
          </div>
          <hr className="demo-divider" />
          <div className="icon-row">
            <IconButton>
              <CalendarDays size={16} />
            </IconButton>
            <IconButton variant="danger">
              <Trash2 size={16} />
            </IconButton>
          </div>
        </Card>

        <Card title="Tags and Type">
          <div className="tag-row">
            <Tag color="blue">Alimentação</Tag>
            <Tag color="purple">Transporte</Tag>
            <Tag color="pink">Entretenimento</Tag>
            <Tag color="orange">Mercado</Tag>
            <Tag color="green">Investimento</Tag>
          </div>
          <hr className="demo-divider" />
          <div className="tag-row">
            <TypeBadge type="INCOME" />
            <TypeBadge type="EXPENSE" />
          </div>
        </Card>

        <Card title="Pagination and Modal">
          <div className="pagination-row">
            <PaginationButton>{"<"}</PaginationButton>
            <PaginationButton isActive>1</PaginationButton>
            <PaginationButton>2</PaginationButton>
            <PaginationButton>3</PaginationButton>
            <PaginationButton>{">"}</PaginationButton>
          </div>
          <hr className="demo-divider" />
          <p className="subtitle">
            Modal base is available and can be toggled from page state.
          </p>
        </Card>
      </div>

      <Modal
        isOpen={false}
        title="Nova transação"
        subtitle="Registre sua despesa ou receita"
        onClose={() => undefined}
      >
        <Input label="Descrição" placeholder="Ex. Almoço no restaurante" />
        <div style={{ marginTop: 12 }}>
          <Button fullWidth>Salvar</Button>
        </div>
      </Modal>
    </main>
  );
}

export default App;
