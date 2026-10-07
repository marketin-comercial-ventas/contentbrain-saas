import { createHash } from "node:crypto";
import OpenAI from "openai";
import { Anthropic } from "@anthropic-ai/sdk";

export type AIProvider = "openai" | "anthropic";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  tokensUsed?: number;
  model: string;
}

export interface AIAdapter {
  complete(messages: AIMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<AIResponse>;
  getDefaultModel(): string;
}

class OpenAIAdapter implements AIAdapter {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async complete(messages: AIMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<AIResponse> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: messages as any,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    });

    return {
      content: completion.choices[0]?.message?.content ?? "",
      tokensUsed: completion.usage?.total_tokens,
      model: this.model,
    };
  }

  getDefaultModel(): string {
    return this.model;
  }
}

class AnthropicAdapter implements AIAdapter {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model = "claude-3-5-sonnet-20241022") {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async complete(messages: AIMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<AIResponse> {
    const systemMessage = messages.find(m => m.role === "system")?.content ?? "";
    const userMessages = messages.filter(m => m.role !== "system");

    const completion = await this.client.messages.create({
      model: this.model,
      system: systemMessage,
      messages: userMessages.map(m => ({ role: m.role, content: m.content })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    });

    const content = completion.content[0]?.type === "text" ? completion.content[0].text : "";
    return {
      content,
      tokensUsed: completion.usage?.input_tokens + completion.usage?.output_tokens,
      model: this.model,
    };
  }

  getDefaultModel(): string {
    return this.model;
  }
}

function getAdapter(): AIAdapter {
  const provider = (process.env.AI_PROVIDER as AIProvider) ?? "openai";
  const apiKey = provider === "openai"
    ? process.env.OPENAI_API_KEY
    : process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(`API key para ${provider} no configurada`);
  }

  if (provider === "openai") {
    return new OpenAIAdapter(apiKey, process.env.OPENAI_MODEL);
  }
  return new AnthropicAdapter(apiKey, process.env.ANTHROPIC_MODEL);
}

export const aiCore = {
  async complete(messages: AIMessage[], options?: { temperature?: number; maxTokens?: number; provider?: AIProvider }): Promise<AIResponse> {
    const adapter = options?.provider ? getAdapterForProvider(options.provider) : getAdapter();
    return adapter.complete(messages, options);
  },

  getProvider(): AIProvider {
    return (process.env.AI_PROVIDER as AIProvider) ?? "openai";
  },

  getModel(): string {
    return getAdapter().getDefaultModel();
  },
};

function getAdapterForProvider(provider: AIProvider): AIAdapter {
  const apiKey = provider === "openai"
    ? process.env.OPENAI_API_KEY
    : process.env.ANTHROPIC_API_KEY;

  if (!apiKey) throw new Error(`API key para ${provider} no configurada`);

  if (provider === "openai") {
    return new OpenAIAdapter(apiKey, process.env.OPENAI_MODEL);
  }
  return new AnthropicAdapter(apiKey, process.env.ANTHROPIC_MODEL);
}

export function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex").slice(0, 16);
}