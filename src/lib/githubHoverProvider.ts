import * as vscode from "vscode";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import { HoverProvider } from "./types";
import { escape, table } from "./html";

// authentication provider
export const PROVIDER = "github";
// no scope means read only access to public data
// https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/
export const SCOPES: readonly string[] = [];
// button label for signing to GitHub
const ACTION = "Sign in to GitHub";

export class GitHubHoverProvider implements HoverProvider {
  private readonly regexp = /\bgh#(\S+)#([0-9]+)\b/g;

  regExp(): RegExp {
    return this.regexp;
  }

  link(match: RegExpExecArray): string {
    return `https://github.com/${match[1]}/issues/${match[2]}`;
  }

  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    const range = document.getWordRangeAtPosition(position, this.regexp);
    if (range) {
      const word = document.getText(range);
      const match = this.regexp.exec(word);
      if (match) {
        const headers = new Headers();
        const githubToken = await this.token();
        if (githubToken) {
          headers.set("Authorization", "Bearer " + githubToken);
        }
        // we do not know whether it is an issue or pull request but the issue URL works for both
        const response = await fetch(
          `https://api.github.com/repos/${match[1]}/issues/${match[2]}`,
          { headers }
        );
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

      message.supportHtml = true;
      message.appendMarkdown(`### [${type}#${data.number}](${data.html_url}) - `);
      message.appendText(data.title);
      message.appendMarkdown("\n<hr>");

      const createDate = new Date(data.created_at);

      const tableData: string[][] = [
        [
          "Created by:",
          escape(data.user.login),
          "Created:",
          `${createDate.toLocaleString()}, <b>${formatDistanceToNow(createDate, {
            addSuffix: true,
          })}</b>`,
        ],
      ];

      if (data.assignee) {
        tableData.push(["Assigned to:", escape(data.assignee.login)]);
      }

      if (data.closed_at) {
        const closeDate = new Date(data.closed_at);
        tableData.push([
          "Closed by:",
          escape(data.closed_by.login),
          "Closed:",
          `${closeDate.toLocaleString()}, <b>${formatDistanceToNow(closeDate, {
            addSuffix: true,
          })}</b>`,
        ]);
      }

      message.appendMarkdown(table(tableData));

      // scale down the displayed images
      const newBody: string = data.body.replaceAll(
        /<img\s+width="([0-9]+)"\s+height="([0-9]+)"/g,
        (match: string, width: string, height: string): string => {
          const w = Number(width);
          const h = Number(height);
          // maximum size (width or height)
          const max = 500;

          if (w > max || h > max) {
            let newWidth;
            let newHeight;

            if (w > h) {
              const ratio = w / max;
              newWidth = max;
              newHeight = Math.round(h / ratio);
            } else {
              const ratio = h / max;
              newHeight = max;
              newWidth = Math.round(w / ratio);
            }
            return `<img width="${newWidth}" height="${newHeight}"`;
          }

          // the size limit is not exceeded, return the original text
          return match;
        }
      );

      message.appendMarkdown(`<hr>\n\n#### Description\n\n${newBody}`);
    } else {
      message.appendText(
        "Could not fetch data: " + (response.statusText || "Error " + response.status)
      );
    }
    return new vscode.Hover(message);
  }

  private checkRateLimit(response: Response) {
    // check how many requests are remaining
    const remaining = response.headers.get("X-RateLimit-Remaining");

    if (remaining && Number(remaining) <= 10) {
      if (remaining === "0") {
        vscode.window.showErrorMessage("GitHub API rate limit reached!", ACTION).then(
          this.signIn,
          // ignore rejected authentication request
          () => {}
        );
      } else {
        vscode.window
          .showWarningMessage(
            `Reaching GitHub API rate limit: ${remaining} requests remaining.`,
            ACTION
          )
          .then(
            this.signIn,
            // ignore rejected authentication request
            () => {}
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

  private async token(): Promise<string | undefined> {
    const session = await vscode.authentication.getSession(PROVIDER, SCOPES, {
      createIfNone: false,
    });

    return session?.accessToken;
  }

  private async signIn(result: string | undefined) {
    if (result === ACTION) {
      // request GitHub authentication
      const session = await vscode.authentication.getSession(PROVIDER, SCOPES, {
        createIfNone: true,
      });
    }
  }
}
