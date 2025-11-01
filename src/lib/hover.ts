import * as vscode from "vscode";

import { allProviders } from "./providers";

const decorationType = vscode.window.createTextEditorDecorationType({
  borderStyle: "none none solid none",
  borderWidth: "1px",
});

export function updateHovers(editor: vscode.TextEditor) {
  const document = editor.document;
  if (!document) {
    return;
  }

  const text = document.getText();
  const decorations: vscode.DecorationOptions[] = [];

  let match: RegExpExecArray | null;

  allProviders().forEach((provider) => {
    while ((match = provider.regExp().exec(text))) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const decoration: vscode.DecorationOptions = {
        range: new vscode.Range(startPos, endPos),
        hoverMessage: provider.link(match),
      };

      decorations.push(decoration);
    }
  });

  editor.setDecorations(decorationType, decorations);
}
