import axios from "axios";
import { getConfig } from "./config";

const { maxTokens } = getConfig("openai");

type OpenAiResponse = {
  choices: Array<{
    text: string;
  }>;
};

const BASE_URL = "https://api.openai.com";

async function fetchCompletions({
  prompt,
  apiKey,
}: {
  prompt: string;
  apiKey: string;
}) {
  const { data } = await axios.request<OpenAiResponse>({
    url: `${BASE_URL}/v1/completions`,
    method: "post",
    data: {
      model: "text-davinci-003",
      prompt,
      max_tokens: maxTokens,
      temperature: 0,
    },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });
  const { choices } = data;
  return choices;
}

export async function refineJapanese({
  content,
  apiKey,
}: {
  content: string;
  apiKey: string;
}): Promise<string> {
  const prompt = `あなたは日本語の校正者です。わかりやすく簡潔になるように次の文章を改善してください。Markdown記法はできる限り残してください。\n=====\n${content}\n=====`;
  const result = await fetchCompletions({ prompt, apiKey });
  const refinedContent = result.reduce((text, choice) => {
    return (text += choice.text);
  }, "");
  return refinedContent;
}
