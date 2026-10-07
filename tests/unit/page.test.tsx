import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "@/app/page";

describe("página principal de Foundation", () => {
  it("muestra el encabezado de la plataforma", () => {
    render(<Page />);
    expect(
      screen.getByRole("heading", { name: /Plataforma Growth · Sales · Talent/ }),
    ).toBeInTheDocument();
  });

  it("enlaza al endpoint de salud", () => {
    render(<Page />);
    const link = screen.getByRole("link", { name: "/api/health" });
    expect(link).toHaveAttribute("href", "/api/health");
  });
});
