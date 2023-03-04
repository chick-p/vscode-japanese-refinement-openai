# Refine Japanese with OpenAI

This extension refines your text in Japanese with OpenAI.

- Suggest the improved your Japanese text using OpenAI.
- Apply the suggested improvements to your text.

![Animation: Usage image](usage.gif)

## Commands

Available commands:

```json
"commands": [
  {
    "command": "com.github.chick-p.vscode-japanese-refinement-openai.refineJapanese",
    "title": "Refine Japanese with OpenAI"
  },
  {
    "command": "com.github.chick-p.vscode-japanese-refinement-openai.askApiKey",
    "title": "Set OpenAI API key (Refine Japanese with OpenAI)"
  }
]
```

## Installation

This extension is not available on VSCode Marketplace.
Install locally:

```shell
code --install-extension vscode-japanese-refinement-openai-0.0.1.vsix
```

## Getting Started

Steps to begin:

1. Manually install this extension.
1. Generate your personal OpenAI API key.
1. Use the command pallet to run the "Set OpenAI API key" command and input your API key.
1. Select the text you wish to refine in the editor.
1. Right click and select "Refine Japanese with OpenAI" menu.

## Extension Settings

Available settings:

```json
// The maximum number of tokens to generate in the completion.
// See https://platform.openai.com/docs/api-reference/completions/create#completions/create-max_tokens
"vscode-japanese-refinement-openai.openai.maxTokens": {
  "type": "number",
  "default": 2048
}
```
