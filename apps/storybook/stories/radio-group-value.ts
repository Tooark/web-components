import { expect, userEvent, waitFor, within } from "storybook/test";

// Conferência comum às stories dos wrappers React, Vue e Angular do ark-radio-group (não é uma story: o nome do arquivo
// fica fora do glob). A cena, igual nos três: um grupo `name="plano"` com os rádios "pro" (Profissional) e "team"
// (Equipe), sem `value` no primeiro render. `rerender` troca as props do wrapper e espera o framework aplicar.
//
// Sem `value` o grupo não é controlado: a escolha do usuário sobrevive a um novo render do wrapper (o Vue regrava a
// prop `value` a cada render, e um `undefined` gravado tiraria o atributo, que desmarca). Com `value` o grupo é
// controlado: o valor marca, e tirá-lo desmarca todos.

export type RadioGroupProps = { label: string; value?: string };

export async function expectRadioGroupValue(
  scope: HTMLElement,
  rerender: (props: RadioGroupProps) => Promise<void>
): Promise<void> {
  const group = scope.querySelector("ark-radio-group") as HTMLElement;
  const checked = (): string[] =>
    Array.from(group.querySelectorAll("ark-radio"))
      .filter((radio) => radio.hasAttribute("checked"))
      .map((radio) => radio.getAttribute("value") ?? "");

  await userEvent.click(within(group).getByRole("radio", { name: "Equipe" }));
  await expect(group).toHaveAttribute("value", "team");

  await rerender({ label: "Plano atualizado" });
  await expect(group).toHaveAccessibleName("Plano atualizado");
  await expect(checked(), "escolha do usuário depois de um novo render").toEqual(["team"]);
  await expect(group).toHaveAttribute("value", "team");

  await rerender({ label: "Plano", value: "pro" });
  await expect(checked()).toEqual(["pro"]);

  await rerender({ label: "Plano" });
  await expect(checked(), "value tirado pelo app").toEqual([]);
  await waitFor(() => expect(group.hasAttribute("value")).toBe(false));
}
