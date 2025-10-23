import * as vscode from "vscode";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

export class GitHubHoverProvider implements vscode.HoverProvider {
  public static readonly regexp = /\bgh#(\S+)#([0-9]+)\b/g;

  public static link(match: RegExpExecArray): string {
    return `https://github.com/${match[1]}/issues/${match[2]}`;
  }

  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    const range = document.getWordRangeAtPosition(position, GitHubHoverProvider.regexp);
    if (range) {
      const word = document.getText(range);
      const match = GitHubHoverProvider.regexp.exec(word);
      if (match) {
        // we do not know whether it is an issue or pull request but the issue URL works for both
        const response = await fetch(`https://api.github.com/repos/${match[1]}/issues/${match[2]}`);
        this.checkRateLimit(response);
        return this.createHoverMessage(response);
      }
    }
    return null;
  }

  private async createHoverMessage(response: Response): Promise<vscode.Hover> {
    const message = new vscode.MarkdownString();
    if (response.ok) {
      const data: any = await response.json();
      const type = data.pull_request ? "PR" : "Issue";

      message.appendMarkdown(`### [${type}#${data.number}](${data.html_url}) - `);
      message.appendText(data.title);
      message.appendMarkdown(`\n\n${data.body}\n---\n`);

      if (data.assignee) {
        message.appendMarkdown(`Assigned to *${data.assignee.login}*  \n`);
      }

      const createDate = new Date(data.created_at);
      message.appendMarkdown(
        `Created by *${data.user.login}* ${formatDistanceToNow(createDate, {
          addSuffix: true,
        })} on *${createDate.toLocaleString()}*  \n`
      );

      if (data.closed_at) {
        const closeDate = new Date(data.closed_at);
        message.appendMarkdown(
          `Closed by *${data.closed_by.login}* ${formatDistanceToNow(closeDate, {
            addSuffix: true,
          })} on *${closeDate.toLocaleString()}*  \n`
        );
      }
    } else {
      message.appendMarkdown(`Could not fetch data: ${response.statusText}`);
    }
    return new vscode.Hover(message);
  }

  private checkRateLimit(response: Response) {
    // check how many requests are remaining
    const remaining = response.headers.get("X-RateLimit-Remaining");

    if (remaining && Number(remaining) <= 10) {
      if (remaining === "0") {
        vscode.window.showErrorMessage("GitHub API rate limit reached!");
      } else {
        vscode.window.showWarningMessage(
          `Reaching GitHub API rate limit: ${remaining} requests remaining.`
        );
      }

      if (response.headers.get("X-RateLimit-Reset")) {
        const resetTime = parseInt(response.headers.get("X-RateLimit-Reset") || "0") * 1000;
        const resetMinutes = Math.round((resetTime - Date.now()) / 1000 / 60);
        vscode.window.showInformationMessage(
          `GitHub rate limit will reset after ${resetMinutes} minutes.`
        );
      }
    }
  }
}
