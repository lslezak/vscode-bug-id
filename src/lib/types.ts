import * as vscode from "vscode";

export interface HoverProvider extends vscode.HoverProvider {
  // return regexp for matching the bug ID
  regExp(): RegExp;
  // create an URL link for the matched bug ID, the "match" parameter
  // is the result of matching the "regexp()" against the text
  link(match: RegExpExecArray): string;
}
