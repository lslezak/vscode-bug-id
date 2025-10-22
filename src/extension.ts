import * as vscode from "vscode";
import { updateHovers } from "./lib/hover";
import { GitHubHoverProvider } from "./lib/githubHoverProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let activeEditor = vscode.window.activeTextEditor;
  // delay updating the diagnostics if the document is changing too quickly
  let timeout: NodeJS.Timeout | undefined = undefined;

  let disposable = vscode.languages.registerHoverProvider(
    // apply to all files
    { pattern: "**/*" },
		new GitHubHoverProvider()
  );

  context.subscriptions.push(disposable);

  if (activeEditor) {
    updateHovers(activeEditor);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      activeEditor = editor;

      if (activeEditor) {
        updateHovers(activeEditor);
      }
    })
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      // a change in the active document, postpone the validation to
      // avoid too many expensive updates when the user is typing very quickly
      if (activeEditor && event.document === activeEditor.document) {
        // if there already is a pending decoration then cancel it
        if (timeout) {
          clearTimeout(timeout);
        }
        // schedule a new decoration
        timeout = setTimeout(
          () => activeEditor && updateHovers(activeEditor),
          500
        );
      }
    },
    null,
    context.subscriptions
  );
}

// called when the extension is deactivated
export function deactivate() {}
