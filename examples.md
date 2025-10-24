# Examples

This file contains several examples of bug IDs. It is useful for testing the
extension functionality.

Just open the file in VSCode editor with installed extension and try hovering
the mouse pointer over the bug IDs below.

## Fully working examples

Bugzilla based bug tracking systems:

- SUSE bugzilla: bsc#1221759 bsc#1027043
- openSUSE bugzilla: boo#1221759 boo#1027043  
  (the same bugs, just accessed via a different URL)
- Novell bugzilla bnc#1221759 bnc#1027043  
  (the same bugs, Novell bugzilla is down, links to the SUSE bugzilla instead)
- GCC bugzilla examples: GCC#88209 GCC#107536
- KDE bugzilla examples: kde#481863 kde#476831
- Kernel bugzilla examples: bko#220675 bko#220667 bko#141541
- Mozilla bugzilla examples: bmo#1432721 bmo#1987445
- Redhat bugzilla examples: rh#2405846 rh#177841

Other systems:

- GitHub issues: gh#agama-project/agama#1894 gh#openSUSE/zypper#622 (pull
  request) gh#openSUSE/zypper#560 (issue)
- Progress openSUSE: poo#189702 (loading details not implemented)

## Examples which require API key

These examples need an API key with appropriate access permission otherwise
fetching the data fails.

- SUSE bugzilla: bsc#1248276

## Broken examples

These bugzilla systems do not response properly for the REST API requests
so the details are not displayed. But clicking the URL link works fine
and opens the bug report in the web browser correctly.

- Gnome bugzilla examples: bgo#95893
- Samba bugzilla examples: bso#15903 bso#13291
