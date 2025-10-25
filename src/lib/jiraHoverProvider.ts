import * as vscode from "vscode";

import { HoverProvider } from "./types";

export class JiraHoverProvider implements HoverProvider {
  private readonly regexp = /\bjsc#(\S+)\b/ig;

  regExp(): RegExp {
    return this.regexp;
  }

  link(match: RegExpExecArray): string {
    return `https://jira.suse.com/browse/${match[1]}`;
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
