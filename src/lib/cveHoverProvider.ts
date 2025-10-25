import * as vscode from "vscode";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import { HoverProvider } from "./types";

export class CveHoverProvider implements HoverProvider {
  private readonly regexp = /\bCVE-([12][0-9]{3}-[0-9]+)\b/g;

  regExp(): RegExp {
    return this.regexp;
  }

  link(match: RegExpExecArray): string {
    return `https://nvd.nist.gov/vuln/detail/CVE-${match[1]}`;
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
        const response = await fetch(
          `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-${match[1]}`
        );
        return this.createHoverMessage(response);
      }
    }
    return null;
  }

  private async createHoverMessage(response: Response): Promise<vscode.Hover> {
    const message = new vscode.MarkdownString();
    
    if (response.ok) {
      const data: any = await response.json();
      const cve = data?.vulnerabilities?.[0]?.cve;

      if (cve) {
        message.appendMarkdown(`### [${cve.id}](https://nvd.nist.gov/vuln/detail/${cve.id})\n\n`);

        message.appendMarkdown(`Status: ${cve.vulnStatus}`);
        message.appendMarkdown("\n\n---\n\n");

        const descriptions = cve.descriptions
          ?.filter((d: any) => d.lang === "en")
          ?.map((d: any) => d.value);
        descriptions && message.appendText(descriptions.join("  \n\n") + "\n\n");

        const references = cve?.references?.map((r: any) => r.url);
        if (references?.length > 0) {
          const uniqueRefs = [...new Set(references)];
          const refList = uniqueRefs.map((r: any) => `- ${r}\n`);
          message.appendMarkdown(`#### References\n\n${refList.join("")}\n`);
        }

        const weaknesses = cve?.weaknesses
          ?.flatMap((w: any) => w.description)
          ?.filter((w: any) => w.lang === "en")
          .map((w: any) => w.value);
        if (weaknesses) {
          const uniqueWeaknesses = [...new Set(weaknesses)];
          // Note: we could possibly fetch the CWE details via REST API
          // https://cwe-api.mitre.org/api/v1/cwe/weakness/327
          // but that would be probably too much, let's just place a link here
          const wList = uniqueWeaknesses.map((w: any) => {
            const id = /CWE-([0-9]+)/.exec(w)?.[1];
            return `- [${w}](https://cwe.mitre.org/data/definitions/${id}.html)\n`;
          });
          message.appendMarkdown(`#### Weaknesses\n\n${wList}\n`);
        }

        message.appendMarkdown(`\n\n---\n`);

        const publishedDate = new Date(cve.published);
        message.appendMarkdown(
          `Published: ${publishedDate.toLocaleString()}, **${formatDistanceToNow(publishedDate, {
            addSuffix: true,
          })}**   \n`
        );

        const modifiedDate = new Date(cve.published);
        message.appendMarkdown(
          `Modified: ${modifiedDate.toLocaleString()}, **${formatDistanceToNow(modifiedDate, {
            addSuffix: true,
          })}**   \n`
        );
      }
    } else {
      message.appendMarkdown(`Could not fetch data: ${response.statusText}`);
    }
    return new vscode.Hover(message);
  }
}
