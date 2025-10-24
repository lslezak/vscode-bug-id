import * as vscode from "vscode";

export interface HoverProvider extends vscode.HoverProvider {
  link(match: RegExpExecArray): string;
  regExp(): RegExp;
}
