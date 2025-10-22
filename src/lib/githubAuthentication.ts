import * as vscode from "vscode";
import { PROVIDER, SCOPES } from "./githubHoverProvider";

// request GitHub authentication for this extension
export async function requestAuthentication(): Promise<void> {
  const session = await vscode.authentication.getSession(PROVIDER, SCOPES, {
    createIfNone: false,
  });

  if (session) {
    vscode.window.showInformationMessage(
      "The Bug ID extension is already authenticated to GitHub."
    );
  } else {
    // we do not need to wait for the result
    vscode.authentication.getSession(PROVIDER, SCOPES, {
      createIfNone: true,
    });
  }
}
