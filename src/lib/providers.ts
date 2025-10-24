import { GitHubHoverProvider } from "./githubHoverProvider";
import { BugzillaHoverProvider } from "./bugzillaHoverProvider";

import { HoverProvider } from "./types";

export function allProviders(): HoverProvider[] {
  return [
    new GitHubHoverProvider(),
    // SUSE bugzilla
    new BugzillaHoverProvider(
      "https://bugzilla.suse.com",
      /\bbsc#([0-9]+)\b/ig,
      "bugzilla.suse.token"
    ),
    // openSUSE bugzilla, the same API token works for both
    new BugzillaHoverProvider(
      "https://bugzilla.opensuse.org",
      /\bboo#([0-9]+)\b/g,
      "bugzilla.suse.token"
    ),
  ];
}
