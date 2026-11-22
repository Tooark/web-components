// Verificação só de tipos: o build roda `tsc -p tsconfig.typecheck.json` (noEmit) sobre este arquivo. Fixa que as
// subpaths @tooark/react/chart, /code e /wysiwyg tipam os wrappers e as tags cruas com as propriedades JS (o JSX
// rejeitava `option`, `value` e `extensions` antes), e que um tipo errado continua sendo erro.
import type { ReactNode } from "react";
import { ArkChart } from "../src/chart.js";
import { ArkCodeEditor } from "../src/code.js";
import { ArkWysiwygEditor, ArkWysiwygViewer } from "../src/wysiwyg.js";

const option = { xAxis: { type: "category" as const }, yAxis: {}, series: [{ type: "bar" as const, data: [1, 2] }] };
const doc = { type: "doc", content: [{ type: "paragraph" }] };

/** Wrappers e tags cruas com as propriedades JS. */
export const accepted: ReactNode[] = [
  <ArkChart key="chart" option={option} palette="tokens" height="240px" onChartClick={(event) => event.detail} />,
  <ark-chart key="raw-chart" option={option} theme="dark" />,
  <ArkCodeEditor
    key="code"
    value="{}"
    language="json"
    maxHeight="20rem"
    lineNumbers={false}
    variables={[{ key: "baseUrl", intent: "info" }]}
    extensions={[]}
    onChange={(event) => event.detail.value}
    onSubmit={(event) => event.detail.value}
  />,
  <ark-code-editor key="raw-code" value="{}" variableKeys={["token"]} formatter={(value) => value} />,
  <ArkWysiwygEditor
    key="wysiwyg"
    content={doc}
    toolbar="marks"
    colors={["#2563eb"]}
    onChange={(event) => event.detail}
  />,
  <ark-wysiwyg-editor key="raw-wysiwyg" uploadFile={async () => ({ src: "https://x.test/a.png" })} />,
  <ArkWysiwygViewer key="viewer" content={doc} />
];

/** Tipos errados continuam sendo erro. */
export const rejected: ReactNode[] = [
  // @ts-expect-error option é um objeto do ECharts, não texto.
  <ark-chart key="a" option="series" />,
  // @ts-expect-error value é texto.
  <ArkCodeEditor key="b" value={42} />,
  // @ts-expect-error language fora da lista.
  <ark-code-editor key="c" language="rust" />,
  // @ts-expect-error palette fora da lista.
  <ArkChart key="d" palette="brand" />,
  // @ts-expect-error na tag crua o content é o atributo de texto do HTML; o JSON vai pelo wrapper ou pela ref.
  <ark-wysiwyg-viewer key="e" content={doc} />
];
