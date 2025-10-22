# VSCode Bug ID Extension

This is an extension for the [Visual Studio
Code](https://code.visualstudio.com/) (VSCode) IDE.

It shows bug details when placing the mouse cursor over a bug
identifier.

## Features

- Highlighting of the bug IDs in the text (underlined).
- Displays a tooltip with bug details and a link pointing to the bug
  tracking system to see more details.
- It works in all files, documentation, source code, change log...

## Supported bug identifiers

| Identifier                 | Bug tracking system                                      | Notes                                                 |
| -------------------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| `gh#<org>/<repo>#<number>` | [GitHub](https://github.com) issues                      |                                                       |
| `bsc#<number>`             | [SUSE Bugzilla](https://bugzilla.suse.com)               | Shared with openSUSE bugzilla                         |
| `boo#<number>`             | [openSUSE Bugzilla](https://bugzilla.opensuse.org)       | Shared with SUSE bugzilla                             |
| `bnc#<number>`             | Novell Bugzilla                                          | Not available anymore, redirects to the SUSE bugzilla |
| `GCC#<number>`             | [GCC Bugzilla](https://gcc.gnu.org/bugzilla)             |                                                       |
| `bko#<number>`             | [Linux Kernel Bugzilla](https://bugzilla.kernel.org)     |                                                       |
| `bmo#<number>`             | [Mozilla Bugzilla](https://bugzilla.mozilla.org)         |                                                       |
| `kde#<number>`             | [KDE Bugzilla](https://bugs.kde.org)                     |                                                       |
| `rh#<number>`              | [Redhat Bugzilla](https://bugzilla.redhat.com)           |                                                       |
| `poo#<number>`             | [openSUSE Progress issue](https://progress.opensuse.org) |                                                       |
| `jsc#<ID>`                 | [SUSE Jira](https://jira.suse.com/)                      |                                                       |
| `CVE-<year>-<number>`      | [NIST vulnerability database](https://nvd.nist.gov)      |                                                       |

For more details see the list of [abbreviations used in
openSUSE](https://en.opensuse.org/openSUSE:Packaging_Patches_guidelines#Current_set_of_abbreviations).

## Authentication

Some systems or bugs can be accessed anonymously without any authentication.
However, authentication might increase the allowed request rate limit.

### GitHub

Anonymous access to GitHub API allows 60 requests per hour. Limit for the
authenticated requests is 5000 requests per hour.

To authenticate to GitHub click the "Sign in to GitHub" link displayed in the
warning message displayed when reaching the limit for anonymous requests. Or you
can authenticate anytime by opening the command palette (`Ctrl+Shift+P`) and
selecting the "*Bug ID: Request GitHub authentication*" command. When asked
confirm the access to GitHub for the extension.

### Bugzilla

Bugzilla systems in general allow anonymous access, but some bug reports require
authentication. And some bugs might be accessible only to specific persons or
teams. For example the security bugs might be accessible only to the security
team.

To create an API key and import it to the extension settings just click the
displayed links for a Bugzilla identifier.

Or go to the Bugzilla preferences page, click your account name at the top of
the page and select the "*Preferences*" option. Switch to the "*API KEYS*" tab
and create a new API key. Then go to the extension settings (see below) and
paste the created API key to the appropriate Bugzilla system setting.

### SUSE Jira

SUSE Jira requires authenticated access. To create an API key and import it to
the extension settings click the displayed links for a Jira issue identifier.

Alternatively open your user profile page in Jira and select the "*Personal
Access Tokens*" item in the left menu and then click the "*Create token*" button
in the top right corner. Then go to the extension settings (see below) and paste
the created API key into the Jira setting.

### NIST CVE

Anonymous access allows 5 requests during 30 seconds. Authenticated access is
not supported.

## Extension Settings

The API tokens are stored in the extension settings. To display and the
extension settings open the VSCode setting panel (`Ctrl+,`) and navigate to the
`Extensions -> Bug ID` section.
