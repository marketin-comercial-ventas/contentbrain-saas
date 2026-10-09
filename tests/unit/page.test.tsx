import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "@/app/page";

describe("página principal de ContentBrain", () => {
  it("muestra el encabezado comercial de la plataforma", () => {
    render(<Page />);
    expect(
      screen.getByRole("heading", { name: /Haz crecer tu negocio con inteligencia/ }),
    ).toBeInTheDocument();
  });

  it("ofrece acceso al registro y login", () => {
    render(<Page />);
    expect(screen.getByRole("link", { name: "Crear cuenta" })).toHaveAttribute("href", "/registro");
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute("href", "/login");
  });
});
