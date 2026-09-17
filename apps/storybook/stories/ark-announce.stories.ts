import { announce } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkAnnounce",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "announce(text, politeness) do @tooark/core: live region unica em document.body para leitores de tela. Os componentes a usam para anunciar resultado no lugar (status do botao, copiado, arquivos escolhidos) sem criar live regions dentro do host, que entrariam no nome acessivel do controle."
      }
    }
  }
};

export default meta;

export const Default = {
  render: (): HTMLElement => {
    const container = document.createElement("div");
    container.className = "flex flex-col gap-3";

    const text = document.createElement("p");
    text.className = "text-sm text-slate-600";
    text.textContent =
      'Os botoes anunciam para o leitor de tela; nada muda na tela. Inspecione [data-ark="announcer"] no fim do body.';
    container.appendChild(text);

    const row = document.createElement("div");
    row.className = "flex gap-2";

    const polite = document.createElement("ark-button");
    polite.textContent = "Anunciar (polite)";
    polite.addEventListener("click", () => announce("Requisicao enviada"));
    row.appendChild(polite);

    const assertive = document.createElement("ark-button");
    assertive.setAttribute("intent", "danger");
    assertive.setAttribute("variant", "outline");
    assertive.textContent = "Anunciar (assertive)";
    assertive.addEventListener("click", () => announce("Falha ao enviar", "assertive"));
    row.appendChild(assertive);

    container.appendChild(row);
    return container;
  },
  // Uma unica live region no body, com role por urgencia, e o texto entra depois de esvaziar a regiao.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText("Anunciar (polite)"));
    const polite = document.querySelector<HTMLElement>('[data-ark="announcer-polite"]');
    expect(polite).not.toBeNull();
    expect(polite?.getAttribute("role")).toBe("status");
    expect(polite?.getAttribute("aria-live")).toBe("polite");
    await waitFor(() => expect(polite?.textContent).toBe("Requisicao enviada"));

    await userEvent.click(canvas.getByText("Anunciar (assertive)"));
    const assertive = document.querySelector<HTMLElement>('[data-ark="announcer-assertive"]');
    expect(assertive?.getAttribute("role")).toBe("alert");
    await waitFor(() => expect(assertive?.textContent).toBe("Falha ao enviar"));

    // O mesmo texto de novo: a regiao esvazia antes de receber o texto, senao o leitor nao repete.
    await userEvent.click(canvas.getByText("Anunciar (polite)"));
    expect(polite?.textContent).toBe("");
    await waitFor(() => expect(polite?.textContent).toBe("Requisicao enviada"));

    expect(document.querySelectorAll('[data-ark="announcer"]').length).toBe(1);
    expect(canvasElement.querySelector('[role="status"], [role="alert"]')).toBeNull();
  }
};
