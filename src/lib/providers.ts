import * as vscode from "vscode";

import { BugzillaHoverProvider } from "./bugzillaHoverProvider";
import { CveHoverProvider } from "./cveHoverProvider";
import { GitHubHoverProvider } from "./githubHoverProvider";
import { JiraHoverProvider } from "./jiraHoverProvider";
import { ProgressHoverProvider } from "./progressHoverProvider";

import { HoverProvider } from "./types";

const providers: HoverProvider[] = [];

export function allProviders(): HoverProvider[] {
  return providers;
}

export function createProviders(context: vscode.ExtensionContext) {
  providers.push(
    new GitHubHoverProvider(),
    new ProgressHoverProvider(),
    new CveHoverProvider(),
    new JiraHoverProvider(context),
    // SUSE bugzilla
    new BugzillaHoverProvider(
      "https://bugzilla.suse.com",
      /\bbsc#([0-9]+)\b/gi,
      "bugzilla.suse.token",
      context
    ),
    // openSUSE bugzilla, the same API token works for both
    new BugzillaHoverProvider(
      "https://bugzilla.opensuse.org",
      /\bboo#([0-9]+)\b/g,
      "bugzilla.suse.token",
      context
    ),
    // old Novell bugzilla, does not work anymore but it was shared with SUSE
    // bugzilla so some bug numbers still work there
    new BugzillaHoverProvider(
      "https://bugzilla.suse.com",
      /\bbnc#([0-9]+)\b/gi,
      "bugzilla.suse.token",
      context
    ),
    // gcc bugzilla
    new BugzillaHoverProvider(
      "https://gcc.gnu.org/bugzilla",
      /\bGCC#([0-9]+)\b/g,
      "bugzilla.gcc.token",
      context
    ),
    // KDE bugzilla
    new BugzillaHoverProvider(
      "https://bugs.kde.org",
      /\bkde#([0-9]+)\b/g,
      "bugzilla.kde.token",
      context
    ),
    // Linux kernel bugzilla
    new BugzillaHoverProvider(
      "https://bugzilla.kernel.org",
      /\bbko#([0-9]+)\b/g,
      "bugzilla.kernel.token",
      context
    ),
    // Mozilla bugzilla
    new BugzillaHoverProvider(
      "https://bugzilla.mozilla.org",
      /\bbmo#([0-9]+)\b/g,
      "bugzilla.mozilla.token",
      context
    ),
    // Redhat bugzilla
    new BugzillaHoverProvider(
      "https://bugzilla.redhat.com",
      /\brh#([0-9]+)\b/g,
      "bugzilla.redhat.token",
      context
    )
  );
}
