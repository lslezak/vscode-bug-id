import * as vscode from "vscode";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import { HoverProvider } from "./types";
import { escape, table } from "./html";

export class JiraHoverProvider implements HoverProvider {
  constructor(context: vscode.ExtensionContext) {
    this.secretStorage = context.secrets;
    this.secretStorage.onDidChange((event) => {
      if (event.key === this.key) {
        this.loadToken();
      }
    });
    this.loadToken();
  }

  private readonly regexp = /\bjsc#(\S+)\b/gi;
  private readonly key = "token.jira.suse";

  private secretStorage: vscode.SecretStorage;
  private token: string | undefined;

  private loadToken(): void {
    this.secretStorage.get(this.key).then((secret) => (this.token = secret));
  }

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
    const range = document.getWordRangeAtPosition(position, this.regexp);

    if (range) {
      if (!this.token) {
        const message = new vscode.MarkdownString();
        message.appendMarkdown(
          "You need to authenticate to the Jira.  \nCreate a new [API access token]" +
            "(https://jira.suse.com/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens)" +
            ` and add it to the [Bug ID extension](command:bug-id.token.manager?${encodeURIComponent(
              JSON.stringify(this.key)
            )}).`
        );
        // to render the command link
        message.isTrusted = true;
        return new vscode.Hover(message);
      }

      const word = document.getText(range);
      const match = this.regexp.exec(word);

      if (match) {
        const response = await fetch(`https://jira.suse.com/rest/api/2/issue/${match[1]}`, {
          headers: { Authorization: "Bearer " + this.token },
        });
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
      const issue = data.fields;

      message.appendMarkdown(`### [${data.key}](https://jira.suse.com/browse/${data.key}) - `);
      message.appendText(issue.summary);
      message.appendMarkdown("\n<hr>\n");
      message.appendMarkdown(
        table([
          ["Priority", "Resolution", "Status", "Target version"].map((h) => `<b>${h}</b>`),
          [
            issue.priority?.name || "",
            issue.resolution?.name || "",
            issue.status?.name || "",
            issue.customfield_24300?.[0]?.value || "",
          ].map((v) => escape(v)),
        ])
      );
      message.appendMarkdown("\n<hr>\n");

      const createDate = new Date(issue.created);
      const tableData: string[][] = [
        [
          "Reported by:",
          `${escape(issue.reporter?.displayName || "")} (${escape(
            this.formatEmail(issue.reporter?.emailAddress || "")
          )})`,
        ],
        [
          "Reported:",
          `${createDate.toLocaleString()}, <b>${formatDistanceToNow(createDate, {
            addSuffix: true,
          })}</b>`,
        ],
      ];

      if (issue.assignee) {
        tableData.push([
          "Assigned to:",
          `${escape(issue.assignee.displayName)} (${escape(
            this.formatEmail(issue.assignee.emailAddress)
          )})`,
        ]);
      }

      if (issue.resolutiondate) {
        const resolutionDate = new Date(issue.resolutiondate);
        tableData.push([
          "Resolved:",
          `${resolutionDate.toLocaleString()}, <b>${formatDistanceToNow(resolutionDate, {
            addSuffix: true,
          })}</b>`,
        ]);
      }

      const updateDate = new Date(issue.updated);
      tableData.push([
        "Updated:",
        `${updateDate.toLocaleString()}, <b>${formatDistanceToNow(updateDate, {
          addSuffix: true,
        })}</b>`,
      ]);

      message.appendMarkdown(table(tableData));

      message.appendMarkdown("\n<hr>\n\n#### Description\n\n");
      message.appendText(issue.description);
      message.appendMarkdown("\n\n<hr>\n");
    } else {
      if (response.status === 401) {
        message.appendMarkdown(
          this.token
            ? "Cannot read the data, the API token is probably not valid."
            : "You need to authenticate to the Jira.  \nCreate a new [API access token]" +
                "(https://jira.suse.com/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens)" +
                ` and add it to the [Bug ID extension](command:bug-id.token.manager?${encodeURIComponent(
                  JSON.stringify(this.key)
                )}).`
        );
        message.isTrusted = true;
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

  private formatEmail(email: string): string {
    return email.replaceAll(" at ", "@").replaceAll(" dot ", ".");
  }
}
