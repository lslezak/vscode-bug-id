import * as vscode from "vscode";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import { HoverProvider } from "./types";
import { escape, table } from "./html";

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
    const range = document.getWordRangeAtPosition(position, this.regexp);
    if (range) {
      const word = document.getText(range);
      const match = this.regexp.exec(word);
      if (match) {
        const response = await fetch(`https://progress.opensuse.org/issues/${match[1]}.json`);
        return this.createHoverMessage(response);
      }
    }
    return null;
  }

  private async createHoverMessage(response: Response): Promise<vscode.Hover> {
    const message = new vscode.MarkdownString();

    if (response.ok) {
      message.supportHtml = true;
      const data: any = await response.json();
      console.log(data);

      const issue = data.issue;

      message.appendMarkdown(
        `### [#${issue.id}](https://progress.opensuse.org/issues/${issue.id}) - `
      );
      message.appendText(issue.subject);
      message.appendMarkdown("\n\n<hr>\n\n");
      message.appendMarkdown(
        table([
          ["Priority", "Status", "Project"].map((h) => `<b>${h}</b>`),
          [issue.priority?.name || "", issue.status?.name || "", issue.project?.name || ""].map(
            (v) => escape(v)
          ),
        ])
      );
      message.appendMarkdown("\n<hr>\n");

      const createDate = new Date(issue.created_on);
      const tableData: string[][] = [
        ["Created by:", escape(issue.author?.name || "")],
        [
          "Created:",
          `${createDate.toLocaleString()}, <b>${formatDistanceToNow(createDate, {
            addSuffix: true,
          })}</b>`,
        ],
      ];

      if (issue.assigned_to) {
        tableData.push(["Assigned to:", escape(issue.assigned_to.name || "")]);
      }

      if (issue.closed_on) {
        const closedDate = new Date(issue.closed_on);
        tableData.push([
          "Closed:",
          `${closedDate.toLocaleString()}, <b>${formatDistanceToNow(closedDate, {
            addSuffix: true,
          })}</b>`,
        ]);
      }

      const updateDate = new Date(issue.updated_on);
      tableData.push([
        "Updated:",
        `${updateDate.toLocaleString()}, <b>${formatDistanceToNow(updateDate, {
          addSuffix: true,
        })}</b>`,
      ]);

      message.appendMarkdown(table(tableData));

      message.appendMarkdown("\n<hr>\n\n#### Description\n\n");
      if (issue.description) {
        message.appendText(issue.description);
      } else {
        message.appendMarkdown("*Empty*");
      }
      message.appendMarkdown("\n\n<hr>\n");
    } else {
      if (response.status === 401) {
        message.appendMarkdown("Authentication required.");
      } else if (response.status === 403) {
        message.appendMarkdown("You do not have permissions to see the details.");
      } else {
        message.appendText(
          "Could not fetch data: " + (response.statusText || "Error " + response.status)
        );
      }
    }

    return new vscode.Hover(message);
  }
}
