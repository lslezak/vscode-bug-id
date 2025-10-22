// escape HTML characters
export function escape(text: string): string {
  if (!text) {
    return "";
  }

  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// additional spacing in tables
const spacing = " &nbsp;&nbsp; ";

// build an HTML table, table tags are allowed in VSCode markdown
// see https://github.com/microsoft/vscode/blob/6d2920473c6f13759c978dd89104c4270a83422d/src/vs/base/browser/markdownRenderer.ts#L296
export function table(data: string[][]): string {
  let table: string = "<table>";

  data.forEach((line) => {
    table += "<tr>";
    line.forEach((column) => {
      table += "<td>" + column + spacing + "</td>";
    });
    table += "</tr>";
  });

  table += "</table>";

  return table;
}
