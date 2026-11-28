import { expect, waitFor } from "storybook/test";

/**
 * Confere os atributos opt-in da 1.10.0 renderizados por um wrapper (React, Vue ou Angular), na mesma cena nos três:
 * cada prop nova chega ao elemento e produz o efeito dela.
 */
export async function expectOptInAttributes(canvasElement: HTMLElement): Promise<void> {
  const textarea = canvasElement.querySelector("ark-textarea") as HTMLElement;
  await waitFor(() => expect(textarea).toHaveAttribute("max-rows", "4"));
  await expect((textarea.querySelector("textarea") as HTMLTextAreaElement).style.maxHeight).not.toBe("");

  const toggle = canvasElement.querySelector("ark-switch") as HTMLElement;
  await expect(toggle).toHaveAttribute("label-position", "start");
  const helper = toggle.querySelector('[data-ark="switch-helper"]') as HTMLElement;
  await expect(helper).toHaveTextContent("Um resumo por dia.");
  await expect(toggle.querySelector('[role="switch"]')).toHaveAttribute("aria-describedby", helper.id);
}
