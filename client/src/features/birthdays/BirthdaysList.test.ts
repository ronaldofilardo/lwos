import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { hoje } from "@shared/validation";
import { BirthdaysList } from "./BirthdaysList";

describe("BirthdaysList", () => {
  it("renders vínculo, age, and project beside the birth date", () => {
    const [year, month, day] = hoje().split("-");
    const birthday = `${Number(year) - 30}-${month}-${day}`;
    const markup = renderToStaticMarkup(
      createElement(BirthdaysList, {
        people: [
          {
            id: "person-1",
            fullName: "Ana Silva",
            birthDate: birthday,
            vinculo: "TITULAR",
            projectName: "Projeto A",
          },
          {
            id: "person-2",
            fullName: "Bia Silva",
            birthDate: null,
            vinculo: "FILHO",
            projectName: "Projeto B",
          },
        ],
      })
    );
    const columns = [">Nascimento<", ">Vínculo<", ">Idade<", ">Projeto<"];
    const columnPositions = columns.map(column => markup.indexOf(column));

    expect(columnPositions.every(position => position >= 0)).toBe(true);
    expect(columnPositions).toEqual([...columnPositions].sort((a, b) => a - b));
    expect(markup).toContain(">Titular<");
    expect(markup).toContain(">Outros<");
    expect(markup).toContain(">30 anos<");
    expect(markup).toContain(">Projeto A<");
  });
});
