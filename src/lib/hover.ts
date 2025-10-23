import * as vscode from "vscode";

import { GitHubHoverProvider } from "./githubHoverProvider";
import { BugzillaHoverProvider } from "./bugzillaHoverProvider";

// const channel = vscode.window.createOutputChannel("My channel");
// channel.show();
// channel.appendLine("Hello!");

const decorationType = vscode.window.createTextEditorDecorationType({
  borderStyle: "none none solid none",
  borderWidth: "1px",
});

const providers = [GitHubHoverProvider, BugzillaHoverProvider];

export function updateHovers(editor: vscode.TextEditor) {
  const document = editor.document;
  if (!document) {
    return;
  }

  const text = document.getText();
  const decorations: vscode.DecorationOptions[] = [];

  let match: RegExpExecArray | null;

  providers.forEach((provider) => {
    while ((match = provider.regexp.exec(text))) {
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
