# VSCode Bug ID Extension

This is an extension for the [Visual Studio
Code](https://code.visualstudio.com/) (VSCode) IDE.

It fetches and shows bug information from remote bug tracking systems for a
bug identifier displayed in the editor.

## Features

- Highlighting of the bug IDs in the text (underlined).
- On hover it displays a tooltip with bug details and a link pointing to the bug tracking system to
  see more details.
- It works in all files, documentation, source code, change log...

## Supported bug identifiers

| Identifier | Bug tracker | URL Link |
| --- | --- | --- |
| `gh#<org>/<repo>#<number>` | GitHub issues | `https://github.com/<org>/<repo>/issues/<number>` |
| `bsc#<number>` | [SUSE Bugzilla](https://bugzilla.suse.com) | `https://bugzilla.suse.com/show_bug.cgi?id=<number>` |

## Extension Settings

This extension uses these settings:

- `bug-id.bugzilla.suse.com.token`: The API token for accessing the [SUSE
  Bugzilla](https://bugzilla.suse.com). Without a token only the details of the
  publicly visible bugs can be displayed. To create a new API token go to the
  [Bugzilla preferences](https://bugzilla.suse.com/userprefs.cgi?tab=apikey)
  page.

Just go to the settings configuration in VSCode (`Ctrl + ,`) and navigate to the
`Extensions -> Bug ID` section.
