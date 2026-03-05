import { Mail, UserRound, LogOut } from "lucide-react";

import type { AuthUser } from "../../lib/auth";
import { Button, Card, Input } from "../../components/ui";

type ProfilePageProps = {
  user: AuthUser;
  onLogout: () => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfilePage({ user, onLogout }: ProfilePageProps) {
  return (
    <section className="page profile-page">
      <Card className="profile-card">
        <div className="profile-avatar">{getInitials(user.name)}</div>
        <h1 className="profile-name">{user.name}</h1>
        <p className="profile-email">{user.email}</p>

        <div className="profile-form">
          <Input label="Nome completo" defaultValue={user.name} leftIcon={<UserRound size={16} />} />
          <Input
            label="E-mail"
            value={user.email}
            leftIcon={<Mail size={16} />}
            readOnly
            helperText="O e-mail não pode ser alterado"
          />
          <Button fullWidth>Salvar alterações</Button>
          <Button variant="secondary" fullWidth leftIcon={<LogOut size={16} />} onClick={onLogout}>
            Sair da conta
          </Button>
        </div>
      </Card>
    </section>
  );
}
