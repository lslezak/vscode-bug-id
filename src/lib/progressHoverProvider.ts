import * as vscode from "vscode";

import { HoverProvider } from "./types";

export class ProgressHoverProvider implements HoverProvider {
  private readonly regexp = /\bpoo#([0-9]+)\b/g;

  regExp(): RegExp {
    return this.regexp;
  }

  link(match: RegExpExecArray): string {
    return `https://progress.opensuse.org/issues/${match[1]}`;
  }

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    // loading details not implemented yet
    return null;
  }

}
