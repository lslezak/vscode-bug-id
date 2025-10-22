import * as vscode from "vscode";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import { HoverProvider } from "./types";
import { escape, table } from "./html";

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
      message.supportHtml = true;
      const data: any = await responseBug.json();
      const comments: any = await responseComments.json();

      const bug = data.bugs?.[0];
      if (bug) {
        message.appendMarkdown(`### [Bug#${bug.id}](${this.baseUrl}/show_bug.cgi?id=${bug.id}) - `);
        message.appendText(bug.summary);
        message.appendMarkdown("\n\n---\n\n");
        message.appendMarkdown(
          table([
            ["Status", "Resolution", "Severity", "Priority", "Component", "Product"].map(
              (h) => `<b>${h}</b>`
            ),
            [
              bug.status,
              bug.resolution,
              bug.severity,
              bug.priority,
              // might be a string or an array, depends on Bugzilla version/instance
              bug.component.toString(),
              bug.product,
            ].map((v) => escape(v)),
          ])
        );

        message.appendMarkdown("\n\n---\n\n");
        const createdAt = new Date(bug.creation_time);
        const changedAt = new Date(bug.last_change_time);
        message.appendMarkdown(
          table([
            [
              "Reported by: ",
              `${escape(bug.creator_detail?.real_name)} (${escape(bug.creator_detail?.email)})`,
            ],
            [
              "Reported: ",
              `${createdAt.toLocaleString()}, <b>${formatDistanceToNow(createdAt, {
                addSuffix: true,
              })}</b>`,
            ],
            [
              "Assigned to: ",
              `${escape(bug.assigned_to_detail?.real_name)} (${escape(
                bug.assigned_to_detail?.email
              )})`,
            ],
            [
              "Last change: ",
              `${changedAt.toLocaleString()}, <b>${formatDistanceToNow(changedAt, {
                addSuffix: true,
              })}</b>`,
            ],
          ])
        );

        message.appendMarkdown("\n\n---\n#### Description\n\n");
        message.appendText(comments.bugs?.[id]?.comments?.[0]?.text);
      }
    } else {
      // find the failed request, but in most cases if one fails the other fails as well
      const failedRequest = responseBug.ok ? responseComments : responseBug;
      if (failedRequest.status === 401) {
        message.appendMarkdown(
          this.apiToken()
            ? "Cannot read the data, the API token is probably not valid."
            : "You need to authenticate to the Bugzilla.  \nCreate a new [API access token]" +
                `(${this.baseUrl}/userprefs.cgi?tab=apikey)` +
                ` and add it to the [Bug ID extension settings](command:workbench.action.openSettings?%5B%22bug-id.${this.tokenId}%22%5D).`
        );
        // to render the command link
        message.isTrusted = true;
      } else if (failedRequest.status === 403) {
        message.appendMarkdown("You do not have permissions to see the details.");
      } else {
        message.appendText(
          "Could not fetch data: " + (failedRequest.statusText || "Error " + failedRequest.status)
        );
      }
    }
    return new vscode.Hover(message);
  }

  private apiToken(): string | undefined {
    const configuration = vscode.workspace.getConfiguration("bug-id");
    return configuration.get<string>(this.tokenId);
  }

  private createApiUrl(endPoint: string): string {
    const token = this.apiToken();
    const url = this.baseUrl + "/rest/" + endPoint;

    return token ? url + "?api_key=" + encodeURIComponent(token) : url;
  }
}
