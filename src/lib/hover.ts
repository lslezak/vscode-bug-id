import * as vscode from "vscode";
import { GitHubHoverProvider } from "./githubHoverProvider";

// const channel = vscode.window.createOutputChannel("My channel");
// channel.show();
// channel.appendLine("Hello!");

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

  while ((match = GitHubHoverProvider.regexp.exec(text))) {
    const startPos = document.positionAt(match.index);
    const endPos = document.positionAt(match.index + match[0].length);
    const decoration: vscode.DecorationOptions = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: `[https://github.com/${match[1]}/issues/${match[2]}](https://github.com/${match[1]}/issues/${match[2]})`,
    };

    decorations.push(decoration);
  }

  editor.setDecorations(decorationType, decorations);
}
