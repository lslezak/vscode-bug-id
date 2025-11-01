import * as vscode from "vscode";

const providers = [
  {
    label: "Bug tracking systems",
    kind: vscode.QuickPickItemKind.Separator,
  },
  {
    // $(bug) is icon name, see https://microsoft.github.io/vscode-codicons/dist/codicon.html
    label: "$(bug) GCC Bugzilla",
    name: "GCC Bugzilla",
    description: "https://gcc.gnu.org/bugzilla",
    key: "bugzilla.gcc.token",
  },
  {
    label: "$(bug) KDE Bugzilla",
    name: "KDE Bugzilla",
    description: "https://bugs.kde.org",
    key: "bugzilla.kde.token",
  },
  {
    label: "$(bug) Linux kernel Bugzilla",
    name: "Linux kernel Bugzilla",
    description: "https://bugzilla.kernel.org",
    key: "bugzilla.kernel.token",
  },
  {
    label: "$(bug) Mozilla Bugzilla",
    name: "Mozilla Bugzilla",
    description: "https://bugzilla.mozilla.org",
    key: "bugzilla.mozilla.token",
  },
  {
    label: "$(bug) Red Hat Bugzilla",
    name: "Red Hat Bugzilla",
    description: "https://bugzilla.redhat.com",
    key: "bugzilla.redhat.token",
  },
  {
    label: "$(bug) SUSE or openSUSE Bugzilla",
    name: "SUSE or openSUSE Bugzilla",
    description: "https://bugzilla.suse.com or https://bugzilla.opensuse.org",
    key: "bugzilla.suse.token",
  },
  {
    label: "$(lightbulb-empty) SUSE Jira",
    name: "SUSE Jira",
    description: "https://jira.suse.com",
    key: "token.jira.suse",
  },
  {
    label: "Actions",
    kind: vscode.QuickPickItemKind.Separator,
  },
  {
    label: "$(trash) Delete all API tokens",
    description: "Delete all data stored by the Bug ID extension",
    key: "action:delete_all",
  },
];

export function selectToken(context: vscode.ExtensionContext, key: any) {
  if (key) {
    const provider = providers.find((p) => p.key === key);
    if (provider) {
      setToken(provider.name || "", key, context);
      return;
    }
  }

  vscode.window
    .showQuickPick(providers, {
      title: "Bug ID: API token manager",
      placeHolder: "Select which API token you want to configure",
      canPickMany: false,
    })
    .then((selected) => {
      if (selected && selected.key) {
        if (selected.key === "action:delete_all") {
          deleteAllTokens(context);
        } else {
          setToken(selected.name || "", selected.key, context);
        }
      }
    });
}

function deleteAllTokens(context: vscode.ExtensionContext) {
  vscode.window
    .showQuickPick(
      [
        { label: "No", confirmed: false },
        { label: "Yes", description: "Delete all stored tokens", confirmed: true },
      ],
      {
        title: "Bug ID: API token manager",
        placeHolder: "Confirm deleting all API tokens from the Bug ID extension",
        canPickMany: false,
      }
    )
    .then((selected) => {
      if (selected?.confirmed) {
        context.secrets.keys().then((keys) => {
          Promise.allSettled(keys.map((key) => context.secrets.delete(key))).then(() =>
            vscode.window.showInformationMessage("Bug ID: All stored API tokens were deleted")
          );
        });
      }
    });
}

export async function setToken(name: string, key: string, context: vscode.ExtensionContext) {
  const secret = await context.secrets.get(key);

  const entered = await vscode.window.showInputBox({
    title: "Bug ID: API token manager",
    placeHolder: `Enter your ${name} API token, use empty value to delete the stored key.`,
    password: true,
    value: secret,
  });

  if (entered) {
    await context.secrets.store(key, entered);
    vscode.window.showInformationMessage(`Bug ID: API token for ${name} has been updated`);
  } else if (entered === "") {
    await context.secrets.delete(key);
    vscode.window.showInformationMessage(`Bug ID: API token for ${name} has been deleted`);
  }
}
