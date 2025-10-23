import * as vscode from "vscode";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

const spacing = "&nbsp;&nbsp;&nbsp;";

// @staticImplements<HoverMatcherStatic>()
export class BugzillaHoverProvider implements vscode.HoverProvider {
  public static readonly regexp = /\bbsc#([0-9]+)\b/g;

  public static link(match: RegExpExecArray): string {
    return "https://bugzilla.suse.com/show_bug.cgi?id=" + match[1];
  }

  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    const range = document.getWordRangeAtPosition(position, BugzillaHoverProvider.regexp);
    if (range) {
      const word = document.getText(range);
      const match = BugzillaHoverProvider.regexp.exec(word);
      if (match) {
        const bug = await fetch(`https://bugzilla.suse.com/rest/bug/${match[1]}`);
        const comments = await fetch(`https://bugzilla.suse.com/rest/bug/${match[1]}/comment`);
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
          `### [#${bug.id}](https://bugzilla.suse.com/show_bug.cgi?id=${bug.id}) - ${bug.summary}\n\n`
        );
        message.appendMarkdown(
          `| ${spacing} Status ${spacing} | ${spacing} Resolution ${spacing} | ${spacing} Severity ${spacing} | ${spacing} Priority ${spacing}${spacing} | ${spacing} Component ${spacing}${spacing} | ${spacing} Product ${spacing} | \n` +
            "| :--- | :--- | :--- | :--- | :--- | :--- |\n" +
            `| ${spacing} ${bug.status} ${spacing}${spacing} | ${spacing} ${bug.resolution} ${spacing} | ${spacing} ${bug.severity} ${spacing} | ${spacing} ${bug.priority} ${spacing} | ${spacing} ${bug.component} ${spacing}${spacing} | ${spacing} ${bug.product} ${spacing} |\n\n`
        );
        const createdAt = new Date(bug.creation_time);
        const changedAt = new Date(bug.last_change_time);
        message.appendMarkdown(
          `Reported by: [${bug.creator_detail?.real_name}](mailto:${
            bug.creator_detail?.email
          }) ${spacing} Date: ${createdAt.toLocaleString()}, **${formatDistanceToNow(createdAt, {
            addSuffix: true,
          })}**  \n`
        );
        message.appendMarkdown(
          `Assigned to: [${bug.assigned_to_detail?.real_name}](mailto:${
            bug.assigned_to_detail?.email
          }) ${spacing} Last change: ${changedAt.toLocaleString()}, **${formatDistanceToNow(changedAt, {
            addSuffix: true,
          })}**  \n`
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
}
