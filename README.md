# VSCode Bug ID Extension

This is an extension for the [Visual Studio
Code](https://code.visualstudio.com/) (VSCode) IDE.

It fetches and shows bug information from remote bug tracking systems for a
bug identifier displayed in the editor.

## Features

- Highlighting of the bug IDs in the text (underlined).
- On hover it displays a tooltip with bug details and a link pointing to the bug
  tracking system to see more details.
- It works in all files, documentation, source code, change log...

## Supported bug identifiers

| Identifier | Bug tracking system | Notes|
| --- | --- | --- |
| `gh#<org>/<repo>#<number>` | [GitHub](https://github.com) issues | |
| `bsc#<number>` | [SUSE Bugzilla](https://bugzilla.suse.com) | Shared with openSUSE bugzilla |
| `boo#<number>` | [openSUSE Bugzilla](https://bugzilla.opensuse.org) | Shared with SUSE bugzilla |
| `bnc#<number>` | Novell Bugzilla (down) | Not available anymore, redirects to the SUSE bugzilla |
| `GCC#<number>` | [GCC Bugzilla](https://gcc.gnu.org/bugzilla) | |
| `bko#<number>` | [Linux Kernel Bugzilla](https://bugzilla.kernel.org) | |
| `bmo#<number>` | [Mozilla Bugzilla](https://bugzilla.mozilla.org) | |
| `kde#<number>` | [KDE Bugzilla](https://bugs.kde.org) | |
| `rh#<number>`  | [Redhat Bugzilla](https://bugzilla.redhat.com) | |
| `bso#<number>` | [Samba Bugzilla](https://bugzilla.samba.org) | Loading bug details does not work |
| `bgo#<number>` | [GNOME Bugzilla](https://bugzilla.gnome.org) (obsolete) | Loading bug details does not work |
| `poo#<number>` | [Progress openSUSE](https://progress.opensuse.org) | Loading details not implemented |

## Extension Settings

The access API token for Bugzilla based bug tracking systems can be added in the
extension settings. Without API token only the details of the publicly visible
bugs can be displayed.

Go to the settings configuration in VSCode (`Ctrl + ,`) and navigate to the
`Extensions -> Bug ID` section.
