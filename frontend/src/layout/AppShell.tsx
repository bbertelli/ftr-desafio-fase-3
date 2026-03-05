import { NavLink, Outlet } from "react-router-dom";

import logoImage from "../assets/Logo.svg";
import type { AuthUser } from "../lib/auth";

type AppShellProps = {
  user: AuthUser;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppShell({ user }: AppShellProps) {
  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-header__content">
          <NavLink to="/dashboard" className="shell-logo">
            <img src={logoImage} alt="Financy" />
          </NavLink>

          <nav className="shell-nav">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "shell-nav__link shell-nav__link--active" : "shell-nav__link"
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                isActive ? "shell-nav__link shell-nav__link--active" : "shell-nav__link"
              }
            >
              Transações
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                isActive ? "shell-nav__link shell-nav__link--active" : "shell-nav__link"
              }
            >
              Categorias
            </NavLink>
          </nav>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "shell-avatar shell-avatar--active" : "shell-avatar"
            }
          >
            {getInitials(user.name)}
          </NavLink>
        </div>
      </header>

      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  );
}
