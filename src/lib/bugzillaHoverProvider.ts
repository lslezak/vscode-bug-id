import * as vscode from "vscode";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import { HoverProvider } from "./types";

// spacing used in the Markdown texts
const s = " &nbsp; ";

export class BugzillaHoverProvider implements HoverProvider {
  private baseUrl: string;
  private regexp: RegExp;
  private tokenId: string;

  constructor(base: string, matcher: RegExp, config: string) {
    this.baseUrl = base;
    this.regexp = matcher;
    this.tokenId = config;
  }

  link(match: RegExpExecArray): string {
    return `${this.baseUrl}/show_bug.cgi?id=${match[1]}`;
  }

  regExp(): RegExp {
    return this.regexp;
  }

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    const range = document.getWordRangeAtPosition(position, this.regexp);
    if (range) {
      const word = document.getText(range);
      const match = this.regexp.exec(word);
      if (match) {
        const bug = await fetch(this.createApiUrl(`bug/${match[1]}`));
        const comments = await fetch(this.createApiUrl(`bug/${match[1]}/comment`));
        return this.createHoverMessage(bug, comments, Number(match[1]));
      }
    }
    return null;
  }

  private async createHoverMessage(
    responseBug: Response,
    responseComments: Response,
    id: number
  ): Promise<vscode.Hover> {
    const message = new vscode.MarkdownString();
    if (responseBug.ok && responseComments.ok) {
      const data: any = await responseBug.json();
      const comments: any = await responseComments.json();

      const bug = data.bugs?.[0];
      if (bug) {
        message.appendMarkdown(
          `### [Bug#${bug.id}](${this.baseUrl}/show_bug.cgi?id=${bug.id}) - `
        );
        message.appendText(bug.summary);
        message.appendMarkdown(
          `\n\n|${s}Status${s}|${s}Resolution${s}|${s}Severity${s} |${s}Priority${s}|${s}Component${s}${s}|${s}Product${s}| \n` +
            "| :--- | :--- | :--- | :--- | :--- | :--- |\n" +
            `|${s}${bug.status}${s + s}|${s}${bug.resolution}${s}|${s}${bug.severity}${s}|${s}${bug.priority}${s}|${s}${bug.component}${s}|${s}${bug.product}${s}|\n\n`
        );
        const createdAt = new Date(bug.creation_time);
        const changedAt = new Date(bug.last_change_time);
        message.appendMarkdown(
          `Reported by: [${bug.creator_detail?.real_name}](mailto:${bug.creator_detail?.email}) ${
            s + s + s
          } Date: ${createdAt.toLocaleString()}, **${formatDistanceToNow(createdAt, {
            addSuffix: true,
          })}**  \n`
        );
        message.appendMarkdown(
          `Assigned to: [${bug.assigned_to_detail?.real_name}](mailto:${
            bug.assigned_to_detail?.email
          }) ${s + s + s} Last change: ${changedAt.toLocaleString()}, **${formatDistanceToNow(
            changedAt,
            {
              addSuffix: true,
            }
          )}**  \n`
        );
        message.appendMarkdown("\n---\n\n");
        message.appendMarkdown("#### Description\n");
        message.appendText(comments.bugs?.[id]?.comments?.[0]?.text);
      }
    } else {
      message.appendMarkdown(`Could not fetch data: ${responseBug.statusText}`);
    }
    return new vscode.Hover(message);
  }

  private createApiUrl(endPoint: string): string {
    const configuration = vscode.workspace.getConfiguration("bug-id");
    const token = configuration.get<string>(this.tokenId);
    const url = this.baseUrl + "/rest/" + endPoint;

    return token && token !== "" ? url + "?api_key=" + encodeURIComponent(token) : url;
  }
}
