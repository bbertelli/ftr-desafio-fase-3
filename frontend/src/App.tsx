import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { LogIn, Mail, UserRound, KeyRound } from "lucide-react";

import "./App.css";
import logoImage from "./assets/Logo.svg";
import { LOGIN_MUTATION, SIGNUP_MUTATION } from "./graphql/auth";
import { clearAuthToken, getAuthToken, setAuthToken } from "./lib/auth";
import { Button, Card, Input } from "./components/ui";

type AuthPayload = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type LoginResponse = { login: AuthPayload };
type SignupResponse = { signup: AuthPayload };

function App() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => getAuthToken());

  const [loginMutation, { loading: loginLoading }] =
    useMutation<LoginResponse>(LOGIN_MUTATION);
  const [signupMutation, { loading: signupLoading }] =
    useMutation<SignupResponse>(SIGNUP_MUTATION);

  const isSubmitting = loginLoading || signupLoading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError(null);

    try {
      if (mode === "login") {
        const response = await loginMutation({
          variables: {
            input: { email, password },
          },
        });

        const newToken = response.data?.login.token;

        if (!newToken) {
          setAuthError("Não foi possível fazer login.");
          return;
        }

        setAuthToken(newToken);
        setToken(newToken);
        return;
      }

      const response = await signupMutation({
        variables: {
          input: { name, email, password },
        },
      });

      const newToken = response.data?.signup.token;

      if (!newToken) {
        setAuthError("Não foi possível criar sua conta.");
        return;
      }

      setAuthToken(newToken);
      setToken(newToken);
    } catch (error) {
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError("Ocorreu um erro inesperado.");
      }
    }
  }

  function switchMode(nextMode: "login" | "signup") {
    setMode(nextMode);
    setAuthError(null);
  }

  function handleLogout() {
    clearAuthToken();
    setToken(null);
    setName("");
    setEmail("");
    setPassword("");
  }

  if (token) {
    return (
      <main className="auth-page">
        <div className="logo-wrapper">
          <img src={logoImage} alt="Financy" className="logo-icon" />
        </div>

        <Card className="auth-card">
          <h1 className="auth-title">Você está logado</h1>
          <p className="auth-subtitle">
            Próxima etapa: conectar dashboard, transações e categorias reais.
          </p>
          <div className="auth-actions">
            <Button fullWidth>Ir para dashboard</Button>
            <Button variant="secondary" fullWidth onClick={handleLogout}>
              Sair da conta
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="logo-wrapper">
        <img src={logoImage} alt="Financy" className="logo-icon" />
      </div>

      <Card className="auth-card">
        <h1 className="auth-title">
          {mode === "login" ? "Fazer login" : "Criar conta"}
        </h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Entre na sua conta para continuar"
            : "Comece a controlar suas finanças ainda hoje"}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <Input
              label="Nome completo"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Seu nome completo"
              leftIcon={<UserRound size={16} />}
              required
            />
          ) : null}

          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="mail@exemplo.com"
            leftIcon={<Mail size={16} />}
            required
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua senha"
            leftIcon={<KeyRound size={16} />}
            helperText={
              mode === "signup" ? "A senha deve ter no mínimo 6 caracteres." : undefined
            }
            required
          />

          {authError ? <p className="auth-error">{authError}</p> : null}

          <Button type="submit" fullWidth leftIcon={<LogIn size={16} />} disabled={isSubmitting}>
            {isSubmitting
              ? "Enviando..."
              : mode === "login"
                ? "Entrar"
                : "Cadastrar"}
          </Button>
        </form>

        <div className="auth-switch">
          {mode === "login" ? (
            <>
              <span>Ainda não tem uma conta?</span>
              <Button variant="secondary" fullWidth onClick={() => switchMode("signup")}>
                Criar conta
              </Button>
            </>
          ) : (
            <>
              <span>Já tem uma conta?</span>
              <Button variant="secondary" fullWidth onClick={() => switchMode("login")}>
                Fazer login
              </Button>
            </>
          )}
        </div>
      </Card>
    </main>
  );
}

export default App;
