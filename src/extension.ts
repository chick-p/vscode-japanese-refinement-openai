import * as vscode from "vscode";

import { refineJapanese } from "./openapi";

export function activate(context: vscode.ExtensionContext) {
  const extentionId = "com.github.chick-p.vscode-japanese-refinement-openai";
  const extensionName = "by OpenAI";
  const secretStorageKey = `${extentionId}-openai-api-key`;

  class RefineJapaneseCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
      vscode.CodeActionKind.QuickFix,
    ];

    provideCodeActions(
      document: vscode.TextDocument,
      range: vscode.Range | vscode.Selection,
      context: vscode.CodeActionContext,
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
      const fix = new vscode.CodeAction(
        "Apply the refined text by OpenAI",
        vscode.CodeActionKind.QuickFix,
      );
      fix.edit = new vscode.WorkspaceEdit();
      const diagnostic = context.diagnostics.find(
        (d) => d.code === extensionName,
      );
      if (!diagnostic) {
        return [];
      }
      const refinedContent = diagnostic.message;
      fix.edit.replace(document.uri, range, refinedContent);
      return [fix];
    }
  }

  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection(extensionName);

  const secrets = context.secrets;
  const disposableForSecrets = vscode.commands.registerCommand(
    `${extentionId}.askApiKey`,
    async () => {
      const apiKey = await vscode.window.showInputBox({
        title: "Enter your OpenAI API key",
        password: true,
      });
      if (apiKey) {
        await secrets.store(secretStorageKey, apiKey);
      }
    },
  );
  context.subscriptions.push(disposableForSecrets);

  const disposableForRefine = vscode.commands.registerCommand(
    `${extentionId}.refineJapanese`,
    async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return;
        }
        const document = editor.document;
        const range = editor.selections[0];
        const content = document.getText(range);
        if (content === "") {
          return;
        }

        const apiKey = await secrets.get(secretStorageKey);
        if (!apiKey) {
          throw new Error("Please set OpenAI API Key.");
        }
        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Refine Japanese",
          },
          async (progress) => {
            progress.report({ message: "Processing by OpenAI..." });

            const refinedContent = await refineJapanese({ apiKey, content });
            if (content === refinedContent) {
              return;
            }
            const diagnostic = new vscode.Diagnostic(
              range,
              refinedContent,
              vscode.DiagnosticSeverity.Information,
            );
            diagnostic.code = extensionName;
            diagnosticCollection.set(document.uri, [diagnostic]);
          },
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          vscode.window.showErrorMessage(err.message);
          console.error(err);
        }
      }
    },
  );

  context.subscriptions.push(disposableForRefine);
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      "markdown",
      new RefineJapaneseCodeActionProvider(),
      {
        providedCodeActionKinds:
          RefineJapaneseCodeActionProvider.providedCodeActionKinds,
      },
    ),
  );
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const changeStart = event.contentChanges[0].range.start;
      const diagnostics = diagnosticCollection.get(event.document.uri);
      const keepDiagnostics = diagnostics?.filter(
        (d) =>
          d.range.start.line < changeStart.line &&
          d.range.start.character < changeStart.character,
      );
      diagnosticCollection.set(event.document.uri, keepDiagnostics);
    }),
  );
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((document) => {
      diagnosticCollection.set(document.uri, []);
    }),
  );
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
