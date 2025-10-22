import * as vscode from "vscode";

export function selectToken(context: vscode.ExtensionContext) {
  vscode.window
    .showQuickPick(
      [
        {
          label: "Bug tracking systems",
          kind: vscode.QuickPickItemKind.Separator,
          key: "",
        },
        { label: "GCC Bugzilla (https://gcc.gnu.org/bugzilla)", key: "bugzilla.gcc.token" },
        { label: "KDE Bugzilla (https://bugs.kde.org)", key: "bugzilla.kde.token" },
        {
          label: "Linux kernel Bugzilla (https://bugzilla.kernel.org)",
          key: "bugzilla.kernel.token",
        },
        { label: "Mozilla Bugzilla (https://bugzilla.mozilla.org)", key: "bugzilla.mozilla.token" },
        { label: "Red Hat Bugzilla (https://bugzilla.redhat.com)", key: "bugzilla.redhat.token" },
        { label: "SUSE Jira (https://jira.suse.com)", key: "token.jira.suse" },
        {
          label: "SUSE/openSUSE Bugzilla (https://bugzilla.suse.com/https://bugzilla.opensuse.org)",
          key: "bugzilla.suse.token",
        },
        {
          label: "Actions",
          kind: vscode.QuickPickItemKind.Separator,
          key: "",
        },
        {
          label: "Delete all API tokens stored by the Bug ID extension",
          key: "action:delete_all",
        },
      ],
      {
        title: "Bug ID: API token manager",
        placeHolder: "Select which API token you want to configure",
        canPickMany: false,
      }
    )
    .then((selected) => {
      if (selected && selected.key) {
        if (selected.key === "action:delete_all") {
          deleteAllTokens(context);
        } else {
          // remove the URL from the label
          setToken(selected.label.replace(/ \(.*\)/, ""), selected.key, context);
        }
      }
    });
}

function deleteAllTokens(context: vscode.ExtensionContext) {
  vscode.window
    .showQuickPick(
      [
        { label: "No", confirmed: false },
        { label: "Yes, delete all", confirmed: true },
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
    title: `Enter your ${name} API token`,
    placeHolder: "Leave empty to delete the current value",
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
