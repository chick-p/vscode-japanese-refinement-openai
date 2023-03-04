import * as vscode from "vscode";

type Config = {
  openai: {
    maxTokens: number;
  };
};

interface GetConfig {
  (key: undefined): "";
  <K extends keyof Config>(key: K): Config[K];
}

export const getConfig: GetConfig = <K extends keyof Config>(key?: K) => {
  const config = vscode.workspace.getConfiguration(
    "vscode-japanese-refinement-openai"
  );
  return key ? config[key] : config;
};
