export const CONTENT_GENERATION_SYSTEM_PROMPT = `Eres un experto en marketing digital y copywriting. Generas contenido de alta conversión adaptado a la marca, producto, audiencia y canal especificados.

REGLAS OBLIGATORIAS:
1. USA SOLO la información proporcionada en el contexto (Company Brain, producto, audiencia). NO inventes datos.
2. Si falta información crítica, indícalo claramente en la respuesta.
3. Adapta el tono, vocabulario y estructura al canal especificado.
4. Incluye siempre: hook principal, contenido desarrollado, CTA claro, hashtags relevantes (si aplica).
5. Genera variantes cuando se solicite.
6. Responde en español a menos que se indique lo contrario.`;

export function buildContentGenerationPrompt(input: {
  companyBrain: {
    name: string;
    description?: string | null;
    industry?: string | null;
    valueProposition?: string | null;
    targetAudience?: string | null;
    tone: string;
    website?: string | null;
    whatsapp?: string | null;
    socialLinkedin?: string | null;
    socialInstagram?: string | null;
    socialTwitter?: string | null;
    socialFacebook?: string | null;
    socialTiktok?: string | null;
  };
  product?: {
    name: string;
    description?: string | null;
    category: string;
    price: number;
    currency: string;
    benefits: string[];
    features: string[];
  } | null;
  audience?: {
    name: string;
    description?: string | null;
    avatarName?: string | null;
    demographics: Record<string, unknown>;
    needs: string[];
    pains: string[];
    motivations: string[];
    objections: string[];
    tone: string;
    cta?: string | null;
  } | null;
  objective: string;
  channel: string;
  tone: string;
  type: string;
  variantsCount: number;
}): string {
  const { companyBrain, product, audience, objective, channel, tone, type, variantsCount } = input;

  let prompt = `CONTEXTO DE MARCA (Company Brain):
- Nombre: ${companyBrain.name}
- Descripción: ${companyBrain.description ?? "No especificada"}
- Industria: ${companyBrain.industry ?? "No especificada"}
- Propuesta de valor: ${companyBrain.valueProposition ?? "No especificada"}
- Audiencia objetivo general: ${companyBrain.targetAudience ?? "No especificada"}
- Tono de marca: ${companyBrain.tone}
- Web: ${companyBrain.website ?? "No especificada"}
- WhatsApp: ${companyBrain.whatsapp ?? "No especificado"}
`;

  if (product) {
    prompt += `
PRODUCTO/SERVICIO:
- Nombre: ${product.name}
- Descripción: ${product.description ?? "No especificada"}
- Categoría: ${product.category}
- Precio: ${product.currency} ${product.price}
- Beneficios: ${product.benefits.join(", ") || "No especificados"}
- Características: ${product.features.join(", ") || "No especificadas"}
`;
  }

  if (audience) {
    prompt += `
AUDIENCIA ESPECÍFICA:
- Nombre: ${audience.name}
- Avatar: ${audience.avatarName ?? "No definido"}
- Descripción: ${audience.description ?? "No especificada"}
- Demografía: ${JSON.stringify(audience.demographics)}
- Necesidades: ${audience.needs.join(", ") || "No especificadas"}
- Dolores/Problemas: ${audience.pains.join(", ") || "No especificados"}
- Motivaciones: ${audience.motivations.join(", ") || "No especificadas"}
- Objeciones: ${audience.objections.join(", ") || "No especificadas"}
- Tono preferido: ${audience.tone}
- CTA sugerido: ${audience.cta ?? "No especificado"}
`;
  }

  prompt += `
OBJETIVO DE LA GENERACIÓN: ${objective}
CANAL: ${channel}
TIPO DE CONTENIDO: ${type}
TONO: ${tone}
NÚMERO DE VARIANTES: ${variantsCount}

FORMATO DE RESPUESTA (JSON):
{
  "principal": {
    "hook": "string",
    "contenido": "string",
    "cta": "string",
    "hashtags": ["string"]
  },
  "variantes": [
    { "hook": "string", "contenido": "string", "cta": "string", "hashtags": ["string"] }
  ],
  "notas": "string (información faltante o advertencias)"
}

Genera el contenido ahora.`;

  return prompt;
}

export function buildAudienceGenerationPrompt(companyBrain: any, product: any | null, brief: string): string {
  return `Eres un estratega de marketing. Crea un perfil de audiencia detallado (avatar) basado en la marca y el brief proporcionado.

MARCA:
- Nombre: ${companyBrain.name}
- Descripción: ${companyBrain.description ?? "No especificada"}
- Industria: ${companyBrain.industry ?? "No especificada"}
- Propuesta de valor: ${companyBrain.valueProposition ?? "No especificada"}
- Tono: ${companyBrain.tone}

${product ? `PRODUCTO REFERENCIA:
- Nombre: ${product.name}
- Descripción: ${product.description ?? "No especificada"}
- Categoría: ${product.category}
- Beneficios: ${product.benefits.join(", ") || "No especificados"}
` : ""}

BRIEF DEL USUARIO: ${brief}

Genera un perfil de audiencia completo en JSON:
{
  "name": "string (nombre descriptivo de la audiencia)",
  "description": "string (descripción general)",
  "avatarName": "string (nombre ficticio del avatar, ej: 'María, gerente de marketing')",
  "demographics": { "edad": "string", "genero": "string", "ubicacion": "string", "ingresos": "string", "cargo": "string" },
  "needs": ["string"],
  "pains": ["string"],
  "motivations": ["string"],
  "objections": ["string"],
  "tone": "string (tono recomendado para esta audiencia)",
  "cta": "string (call to action sugerido)"
}

Responde SOLO con el JSON válido.`;
}