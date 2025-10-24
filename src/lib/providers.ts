import { GitHubHoverProvider } from "./githubHoverProvider";
import { BugzillaHoverProvider } from "./bugzillaHoverProvider";

import { HoverProvider } from "./types";

export function allProviders(): HoverProvider[] {
  return [
    new GitHubHoverProvider(),
    // SUSE bugzilla
    new BugzillaHoverProvider(
      "https://bugzilla.suse.com",
      /\bbsc#([0-9]+)\b/gi,
      "bugzilla.suse.token"
    ),
    // openSUSE bugzilla, the same API token works for both
    new BugzillaHoverProvider(
      "https://bugzilla.opensuse.org",
      /\bboo#([0-9]+)\b/g,
      "bugzilla.suse.token"
    ),
    // old Novell bugzilla, does not work anymore but it was shared with SUSE
    // bugzilla so some bug numbers still work there
    new BugzillaHoverProvider(
      "https://bugzilla.suse.com",
      /\bbnc#([0-9]+)\b/gi,
      "bugzilla.suse.token"
    ),
    // gcc bugzilla
    new BugzillaHoverProvider(
      "https://gcc.gnu.org/bugzilla",
      /\bGCC#([0-9]+)\b/g,
      "bugzilla.gcc.token"
    ),
    // GNOME bugzilla (REST API does not work)
    new BugzillaHoverProvider(
      "https://bugzilla.gnome.org",
      /\bbgo#([0-9]+)\b/g,
      "bugzilla.gnome.token"
    ),
    // KDE bugzilla
    new BugzillaHoverProvider(
      "https://bugs.kde.org",
      /\bkde#([0-9]+)\b/g,
      "bugzilla.kde.token"
    ),
    // Linux kernel bugzilla
    new BugzillaHoverProvider(
      "https://bugzilla.kernel.org",
      /\bbko#([0-9]+)\b/g,
      "bugzilla.kernel.token"
    ),
    // Mozilla bugzilla
    new BugzillaHoverProvider(
      "https://bugzilla.mozilla.org",
      /\bbmo#([0-9]+)\b/g,
      "bugzilla.mozilla.token"
    ),
    // Redhat bugzilla
    new BugzillaHoverProvider(
      "https://bugzilla.redhat.com",
      /\brh#([0-9]+)\b/g,
      "bugzilla.redhat.token"
    ),
    // Samba bugzilla (REST API does not work)
    new BugzillaHoverProvider(
      "https://bugzilla.samba.org",
      /\bbso#([0-9]+)\b/g,
      "bugzilla.samba.token"
    ),
  ];
}
