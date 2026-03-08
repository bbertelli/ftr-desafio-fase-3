import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { KeyRound, LogOut, Mail, UserRound } from "lucide-react";

import { UPDATE_PROFILE_MUTATION } from "../../graphql/profile";
import type { AuthUser } from "../../lib/auth";
import { Button, Card, Input } from "../../components/ui";

type ProfilePageProps = {
  user: AuthUser;
  onLogout: () => void;
  onUserUpdated: (user: AuthUser) => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type UpdateProfileResponse = {
  updateProfile: AuthUser;
};

export function ProfilePage({ user, onLogout, onUserUpdated }: ProfilePageProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [updateProfile, { loading }] = useMutation<UpdateProfileResponse>(
    UPDATE_PROFILE_MUTATION,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("O nome completo é obrigatório.");
      return;
    }

    if (!trimmedEmail) {
      setError("O e-mail é obrigatório.");
      return;
    }

    try {
      const response = await updateProfile({
        variables: {
          input: {
            name: trimmedName,
            email: trimmedEmail,
            ...(password.trim() ? { password: password.trim() } : {}),
          },
        },
      });

      const updatedUser = response.data?.updateProfile;

      if (!updatedUser) {
        setError("Não foi possível atualizar seu perfil.");
        return;
      }

      onUserUpdated(updatedUser);
      setPassword("");
      setSuccess("Perfil atualizado com sucesso.");
    } catch (updateError) {
      if (updateError instanceof Error) {
        setError(updateError.message);
      } else {
        setError("Ocorreu um erro inesperado ao atualizar o perfil.");
      }
    }
  }

  return (
    <section className="page profile-page">
      <Card className="profile-card">
        <div className="profile-avatar">{getInitials(name)}</div>
        <h1 className="profile-name">{name}</h1>
        <p className="profile-email">{email}</p>

        <form className="profile-form" onSubmit={handleSubmit}>
          <Input
            label="Nome completo"
            value={name}
            onChange={(event) => setName(event.target.value)}
            leftIcon={<UserRound size={16} />}
            required
          />
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            leftIcon={<Mail size={16} />}
            required
          />
          <Input
            label="Nova senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            leftIcon={<KeyRound size={16} />}
            helperText="Opcional. Informe apenas se quiser alterar a senha."
          />

          {error ? <p className="auth-error">{error}</p> : null}
          {success ? <p className="profile-success">{success}</p> : null}

          <Button fullWidth type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            className="profile-logout"
            leftIcon={<LogOut size={16} />}
            onClick={onLogout}
          >
            Sair da conta
          </Button>
        </form>
      </Card>
    </section>
  );
}
