import { createHash } from "node:crypto";
import OpenAI from "openai";
import { Anthropic } from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CohereClient } from "cohere-ai";

export type AIProvider = "openai" | "anthropic" | "google" | "cohere" | "mistral" | "groq" | "ollama";

export interface AIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCalls?: any[];
  toolCallId?: string;
  name?: string;
}

export interface AIResponse {
  content: string;
  tokensUsed?: number;
  model: string;
  provider: AIProvider;
  finishReason?: string;
  toolCalls?: any[];
}

export interface AIAdapter {
  complete(messages: AIMessage[], options?: CompletionOptions): Promise<AIResponse>;
  getDefaultModel(): string;
  getProvider(): AIProvider;
  listModels(): Promise<string[]>;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stop?: string[];
  stream?: boolean;
  tools?: any[];
  toolChoice?: "auto" | "none" | "required" | { type: "function"; function: { name: string } };
  responseFormat?: { type: "json_object" | "text" };
  seed?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface AIEvaluationResult {
  score: number;
  reasoning: string;
  criteria: Record<string, number>;
  passed: boolean;
}

export interface AIConsumptionRecord {
  id: string;
  companyId: string;
  userId: string;
  provider: AIProvider;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  requestType: string;
  createdAt: Date;
}

class OpenAIAdapter implements AIAdapter {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async complete(messages: AIMessage[], options?: CompletionOptions): Promise<AIResponse> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: messages as any,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      top_p: options?.topP,
      stop: options?.stop,
      stream: options?.stream ?? false,
      tools: options?.tools,
      tool_choice: options?.toolChoice as any,
      response_format: options?.responseFormat,
      seed: options?.seed,
      presence_penalty: options?.presencePenalty,
      frequency_penalty: options?.frequencyPenalty,
    });

    const choice = (completion as any).choices?.[0];
    const usage = (completion as any).usage;
    return {
      content: choice?.message?.content ?? "",
      tokensUsed: usage?.total_tokens,
      model: this.model,
      provider: "openai",
      finishReason: choice?.finish_reason,
      toolCalls: choice?.message?.tool_calls,
    };
  }

  getDefaultModel(): string {
    return this.model;
  }

  getProvider(): AIProvider {
    return "openai";
  }

  async listModels(): Promise<string[]> {
    const models = await this.client.models.list();
    return models.data.map(m => m.id).filter(m => m.includes("gpt"));
  }
}

class AnthropicAdapter implements AIAdapter {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model = "claude-3-5-sonnet-20241022") {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async complete(messages: AIMessage[], options?: CompletionOptions): Promise<AIResponse> {
    const systemMessage = messages.find(m => m.role === "system")?.content ?? "";
    const userMessages = messages.filter(m => m.role !== "system");

    const completion = await this.client.messages.create({
      model: this.model,
      system: systemMessage,
      messages: userMessages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      top_p: options?.topP,
      stop_sequences: options?.stop,
      tools: options?.tools,
      tool_choice: options?.toolChoice as any,
    });

    const content = completion.content[0]?.type === "text" ? completion.content[0].text : "";
    return {
      content,
      tokensUsed: (completion.usage?.input_tokens ?? 0) + (completion.usage?.output_tokens ?? 0),
      model: this.model,
      provider: "anthropic",
      finishReason: completion.stop_reason,
    };
  }

  getDefaultModel(): string {
    return this.model;
  }

  getProvider(): AIProvider {
    return "anthropic";
  }

  async listModels(): Promise<string[]> {
    return ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"];
  }
}

class GoogleAdapter implements AIAdapter {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model = "gemini-1.5-pro") {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async complete(messages: AIMessage[], options?: CompletionOptions): Promise<AIResponse> {
    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 2000,
        topP: options?.topP,
        topK: options?.topK,
        stopSequences: options?.stop,
        responseMimeType: options?.responseFormat?.type === "json_object" ? "application/json" : undefined,
      },
    });

    const systemMessage = messages.find(m => m.role === "system")?.content ?? "";
    const userMessages = messages.filter(m => m.role !== "system");

    const chat = model.startChat({
      history: userMessages.slice(0, -1).map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    });

    const lastMessage = userMessages[userMessages.length - 1];
    const prompt = systemMessage ? `${systemMessage}\n\n${lastMessage.content}` : lastMessage.content;
    const result = await chat.sendMessage(prompt);

    return {
      content: result.response.text(),
      tokensUsed: result.response.usageMetadata?.totalTokenCount,
      model: this.model,
      provider: "google",
      finishReason: result.response.candidates?.[0]?.finishReason,
    };
  }

  getDefaultModel(): string {
    return this.model;
  }

  getProvider(): AIProvider {
    return "google";
  }

  async listModels(): Promise<string[]> {
    return ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"];
  }
}

class CohereAdapter implements AIAdapter {
  private client: CohereClient;
  private model: string;

  constructor(apiKey: string, model = "command-r-plus") {
    this.client = new CohereClient({ token: apiKey });
    this.model = model;
  }

  async complete(messages: AIMessage[], options?: CompletionOptions): Promise<AIResponse> {
    const systemMessage = messages.find(m => m.role === "system")?.content ?? "";
    const userMessages = messages.filter(m => m.role !== "system");

    const response = await this.client.chat({
      model: this.model,
      message: userMessages[userMessages.length - 1]?.content ?? "",
      preamble: systemMessage,
      chatHistory: userMessages.slice(0, -1).map(m => ({
        role: m.role === "user" ? "USER" : "CHATBOT",
        message: m.content,
      })),
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 2000,
      p: options?.topP,
      k: options?.topK,
      stopSequences: options?.stop,
    });

    return {
      content: response.text,
      tokensUsed: response.meta?.tokens?.inputTokens + response.meta?.tokens?.outputTokens,
      model: this.model,
      provider: "cohere",
      finishReason: response.finishReason,
    };
  }

  getDefaultModel(): string {
    return this.model;
  }

  getProvider(): AIProvider {
    return "cohere";
  }

  async listModels(): Promise<string[]> {
    return ["command-r-plus", "command-r", "command-light"];
  }
}

class MistralAdapter implements AIAdapter {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model = "mistral-large-latest") {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = "https://api.mistral.ai/v1";
  }

async complete(messages: AIMessage[], options?: CompletionOptions): Promise<AIResponse> {
    const body = JSON.stringify({
      model: this.model,
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      top_p: options?.topP,
      stop: options?.stop,
      tools: options?.tools,
      tool_choice: options?.toolChoice,
      response_format: options?.responseFormat,
      random_seed: options?.seed,
      presence_penalty: options?.presencePenalty,
      frequency_penalty: options?.frequencyPenalty,
    });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await response.json();
    const choice = data.choices[0];

    return {
      content: choice?.message?.content ?? "",
      tokensUsed: data.usage?.total_tokens,
      model: this.model,
      provider: "mistral",
      finishReason: choice?.finish_reason,
      toolCalls: choice?.message?.tool_calls,
    };
  }

  getDefaultModel(): string {
    return this.model;
  }

  getProvider(): AIProvider {
    return "mistral";
  }

  async listModels(): Promise<string[]> {
    return ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "codestral-latest"];
  }
}

class GroqAdapter implements AIAdapter {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model = "llama-3.1-70b-versatile") {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = "https://api.groq.com/openai/v1";
  }

async complete(messages: AIMessage[], options?: CompletionOptions): Promise<AIResponse> {
    const body = JSON.stringify({
      model: this.model,
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      top_p: options?.topP,
      stop: options?.stop,
      stream: options?.stream ?? false,
      tools: options?.tools,
      tool_choice: options?.toolChoice,
      response_format: options?.responseFormat,
      seed: options?.seed,
    });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await response.json();
    const choice = data.choices[0];

    return {
      content: choice?.message?.content ?? "",
      tokensUsed: data.usage?.total_tokens,
      model: this.model,
      provider: "groq",
      finishReason: choice?.finish_reason,
      toolCalls: choice?.message?.tool_calls,
    };
  }

  getDefaultModel(): string {
    return this.model;
  }

  getProvider(): AIProvider {
    return "groq";
  }

  async listModels(): Promise<string[]> {
    return ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"];
  }
}

class OllamaAdapter implements AIAdapter {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl = "http://localhost:11434", model = "llama3.1") {
    this.baseUrl = baseUrl;
    this.model = model;
  }

async complete(messages: AIMessage[], options?: CompletionOptions): Promise<AIResponse> {
    const body = JSON.stringify({
      model: this.model,
      messages: messages,
      options: {
        temperature: options?.temperature ?? 0.7,
        num_predict: options?.maxTokens ?? 2000,
        top_p: options?.topP,
        stop: options?.stop,
      },
      stream: options?.stream ?? false,
    });

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const data = await response.json();

    return {
      content: data.message?.content ?? "",
      tokensUsed: data.eval_count + data.prompt_eval_count,
      model: this.model,
      provider: "ollama",
      finishReason: data.done_reason,
    };
  }

  getDefaultModel(): string {
    return this.model;
  }

  getProvider(): AIProvider {
    return "ollama";
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();
      return data.models?.map((m: any) => m.name) ?? [];
    } catch {
      return [];
    }
  }
}

function getAdapter(provider?: AIProvider): AIAdapter {
  const selectedProvider = provider ?? (process.env.AI_PROVIDER as AIProvider) ?? "openai";
  return getAdapterForProvider(selectedProvider);
}

function getAdapterForProvider(provider: AIProvider): AIAdapter {
  const apiKeys: Record<AIProvider, string | undefined> = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    cohere: process.env.COHERE_API_KEY,
    mistral: process.env.MISTRAL_API_KEY,
    groq: process.env.GROQ_API_KEY,
    ollama: process.env.OLLAMA_BASE_URL,
  };

  const apiKey = apiKeys[provider];
  if (!apiKey && provider !== "ollama") {
    throw new Error(`API key para ${provider} no configurada`);
  }

  switch (provider) {
    case "openai":
      return new OpenAIAdapter(apiKey!, process.env.OPENAI_MODEL);
    case "anthropic":
      return new AnthropicAdapter(apiKey!, process.env.ANTHROPIC_MODEL);
    case "google":
      return new GoogleAdapter(apiKey!, process.env.GOOGLE_MODEL);
    case "cohere":
      return new CohereAdapter(apiKey!, process.env.COHERE_MODEL);
    case "mistral":
      return new MistralAdapter(apiKey!, process.env.MISTRAL_MODEL);
    case "groq":
      return new GroqAdapter(apiKey!, process.env.GROQ_MODEL);
    case "ollama":
      return new OllamaAdapter(process.env.OLLAMA_BASE_URL, process.env.OLLAMA_MODEL);
    default:
      throw new Error(`Proveedor no soportado: ${provider}`);
  }
}

// Evaluación de respuestas
export async function evaluateResponse(
  provider: AIProvider,
  prompt: string,
  response: string,
  criteria: Record<string, string>,
  expectedOutput?: string
): Promise<AIEvaluationResult> {
  const evaluator = getAdapterForProvider("openai"); // Usar OpenAI para evaluar
  const criteriaText = Object.entries(criteria).map(([key, desc]) => `${key}: ${desc}`).join("\n");

  const evaluationPrompt = `Evalúa la siguiente respuesta según los criterios dados.

PROMPT ORIGINAL:
${prompt}

RESPUESTA A EVALUAR:
${response}

${expectedOutput ? `SALIDA ESPERADA (referencia):\n${expectedOutput}\n` : ""}

CRITERIOS DE EVALUACIÓN:
${Object.entries(criteria).map(([key, desc]) => `- ${key}: ${desc}`).join("\n")}

Responde SOLO con JSON válido:
{
  "score": 0-100,
  "reasoning": "explicación detallada",
  "criteria": { "criterio1": 0-100, "criterio2": 0-100 },
  "passed": true/false
}`;

  const evalResponse = await getAdapterForProvider("openai").complete([
    { role: "system", content: "Eres un evaluador experto. Responde SOLO con JSON válido." },
    { role: "user", content: evaluationPrompt },
  ], { temperature: 0.1, maxTokens: 1000, responseFormat: { type: "json_object" } });

  try {
    return JSON.parse(evalResponse.content);
  } catch {
    return { score: 0, reasoning: "Error parsing evaluation", criteria: {}, passed: false };
  }
}

// Consumo tracking
export async function recordConsumption(record: Omit<AIConsumptionRecord, "id" | "createdAt">): Promise<void> {
  const { db } = await import("@/server/db/client");
  const { aiConsumption } = await import("@/server/db/schema");

  await db.insert(aiConsumption).values({
    ...record,
    requestType: record.requestType as any,
  });
}

export async function getConsumptionStats(companyId: string, startDate?: Date, endDate?: Date): Promise<{
  totalTokens: number;
  totalCost: number;
  byProvider: Record<string, { tokens: number; cost: number }>;
  byModel: Record<string, { tokens: number; cost: number }>;
  byType: Record<string, { tokens: number; cost: number }>;
}> {
  const { db, eq, and, sql } = await import("@/server/db/client");
  const { aiConsumption } = await import("@/server/db/schema");

  const conditions = [eq(aiConsumption.companyId, companyId)];
  if (startDate) conditions.push(sql`${aiConsumption.createdAt} >= ${startDate}`);
  if (endDate) conditions.push(sql`${aiConsumption.createdAt} <= ${endDate}`);

  const records = await db.select().from(aiConsumption).where(and(...conditions));

  const byProvider: Record<string, { tokens: number; cost: number }> = {};
  const byModel: Record<string, { tokens: number; cost: number }> = {};
  const byType: Record<string, { tokens: number; cost: number }> = {};
  let totalTokens = 0;
  let totalCost = 0;

  for (const r of records) {
    totalTokens += r.totalTokens;
    totalCost += r.estimatedCostUsd;

    if (!byProvider[r.provider]) byProvider[r.provider] = { tokens: 0, cost: 0 };
    byProvider[r.provider].tokens += r.totalTokens;
    byProvider[r.provider].cost += r.estimatedCostUsd;

    if (!byModel[r.model]) byModel[r.model] = { tokens: 0, cost: 0 };
    byModel[r.model].tokens += r.totalTokens;
    byModel[r.model].cost += r.estimatedCostUsd;

    if (!byType[r.requestType]) byType[r.requestType] = { tokens: 0, cost: 0 };
    byType[r.requestType].tokens += r.totalTokens;
    byType[r.requestType].cost += r.estimatedCostUsd;
  }

  return { totalTokens, totalCost, byProvider, byModel, byType };
}

// Cache de respuestas
const responseCache = new Map<string, { response: AIResponse; expiresAt: number }>();

export function getCachedResponse(prompt: string, model: string, provider: AIProvider): AIResponse | null {
  const key = `${provider}:${model}:${hashPrompt(prompt)}`;
  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.response;
  }
  return null;
}

export function setCachedResponse(prompt: string, model: string, provider: AIProvider, response: AIResponse, ttlMs = 3600000): void {
  const key = `${provider}:${model}:${hashPrompt(prompt)}`;
  responseCache.set(key, { response, expiresAt: Date.now() + ttlMs });
}

// Streaming support
export async function* streamCompletion(
  provider: AIProvider,
  messages: AIMessage[],
  options?: CompletionOptions
): AsyncGenerator<string, AIResponse, unknown> {
  const adapter = getAdapterForProvider(provider);
  // Para simplificar, usamos complete normal y simulamos streaming
  const response = await adapter.complete(messages, { ...options, stream: true });
  const words = response.content.split(" ");
  for (const word of words) {
    yield word + " ";
    await new Promise(r => setTimeout(r, 10));
  }
  return response;
}

export const aiCore = {
  async complete(messages: AIMessage[], options?: CompletionOptions & { provider?: AIProvider }): Promise<AIResponse> {
    const adapter = getAdapter(options?.provider);
    return adapter.complete(messages, options);
  },

  async evaluate(prompt: string, response: string, criteria: Record<string, string>, expectedOutput?: string): Promise<AIEvaluationResult> {
    return evaluateResponse("openai", prompt, response, criteria, expectedOutput);
  },

  getProvider(): AIProvider {
    return (process.env.AI_PROVIDER as AIProvider) ?? "openai";
  },

  getModel(): string {
    return getAdapter().getDefaultModel();
  },

  async listModels(provider?: AIProvider): Promise<string[]> {
    return getAdapterForProvider(provider ?? (process.env.AI_PROVIDER as AIProvider) ?? "openai").listModels();
  },

  async getConsumptionStats(companyId: string, startDate?: Date, endDate?: Date) {
    return getConsumptionStats(companyId, startDate, endDate);
  },

  getCachedResponse,
  setCachedResponse,
  streamCompletion,
};

export function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex").slice(0, 16);
}