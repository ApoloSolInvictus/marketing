import {
  cleanText,
  extractOutputText,
  normalizeHistory,
  openAiErrorMessage,
  requirePost,
  sendJson,
} from "./_shared.js";

const CHAT_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

const SYSTEM_PROMPT = `
Eres INFINITI MKT, un estratega senior de marketing digital para una operacion privada.
Responde en espanol profesional, claro y accionable.
Prioriza estrategia, oferta, embudo, canales, calendario, copy, medicion, riesgos y proxima accion.
No inventes metricas reales. Si faltan datos, declara supuestos practicos.
Entrega contenido listo para ejecutar, con listas cortas, tablas markdown cuando ayuden y criterios de calidad.
`;

const MODE_PROMPTS = {
  creative:
    "Crea piezas de copy y angulos creativos con gancho, promesa, prueba, CTA, variantes por canal y recomendaciones de formato.",
  planner:
    "Construye un plan de campana completo: objetivo, publico, oferta, mensajes, canales, calendario, presupuesto, KPIs y checklist de lanzamiento.",
  analyst:
    "Analiza numeros de marketing. Explica lectura, diagnostico, palancas de mejora, riesgos y siguientes experimentos.",
  chat:
    "Actua como consultor de marketing digital y responde con criterio ejecutivo.",
};

function buildInput({ message, history, context, mode }) {
  const cleanMessage = cleanText(message, 10000);
  const cleanMode = MODE_PROMPTS[mode] ? mode : "chat";
  const contextText = context ? `\n\nContexto de trabajo:\n${JSON.stringify(context, null, 2)}` : "";
  const taskText = `${MODE_PROMPTS[cleanMode]}\n\nSolicitud:\n${cleanMessage}${contextText}`;

  const messages = normalizeHistory(history).map((item) => ({
    role: item.role,
    content: item.content,
  }));

  messages.push({
    role: "user",
    content: taskText,
  });

  return messages;
}

function demoResponse({ message, mode, context }) {
  const goal = cleanText(context?.goal || context?.brief?.goal || "crecer demanda calificada", 160);
  const offer = cleanText(context?.offer || context?.brief?.offer || context?.brand?.offer || "solucion de IA aplicada a negocio", 180);
  const audience = cleanText(context?.audience || context?.brief?.audience || context?.brand?.audience || "decisores de negocio", 180);
  const topic = cleanText(message || "campana de marketing", 180);

  if (mode === "planner") {
    return `## Plan de campana\n\n**Objetivo:** ${goal}.\n\n**Oferta:** ${offer}.\n\n**Publico:** ${audience}.\n\n| Fase | Canal | Accion | KPI |\n| --- | --- | --- | --- |\n| Awareness | LinkedIn / Reels | Hook educativo con problema visible | CTR, retencion |\n| Consideracion | Landing / Email | Caso de uso + prueba social | Leads, CPL |\n| Conversion | WhatsApp / Demo | CTA directo a diagnostico | Citas, tasa de cierre |\n| Retencion | Email | Secuencia de valor y upsell | Recompra, referidos |\n\n### Mensaje central\n${topic}\n\n### Checklist\n- Definir una promesa medible.\n- Crear 3 angulos creativos y probarlos 7 dias.\n- Medir CPL, conversion a cita y costo por venta.\n- Pausar anuncios con CPA 30% sobre objetivo.\n\nModo demo activo: agrega OPENAI_API_KEY en Vercel para respuestas generadas por IA.`;
  }

  if (mode === "creative") {
    return `## Copy listo para probar\n\n**Angulo:** transformar ${topic} en una oportunidad concreta para ${audience}.\n\n**Hook 1:** Tu marketing no necesita mas ruido. Necesita una ruta clara hacia ventas.\n\n**Hook 2:** Si cada campana empieza desde cero, estas perdiendo aprendizaje acumulado.\n\n**Post:**\nLas mejores campanas no nacen de publicar mas. Nacen de conectar oferta, publico, canal y medicion.\n\nCon INFINITI MKT puedes ordenar el brief, crear copy, planificar calendario y medir el embudo desde un solo flujo.\n\n**CTA:** Agenda un diagnostico y convierte tus ideas en una campana medible.\n\n**Variantes:**\n- LinkedIn: tono ejecutivo, problema y costo de oportunidad.\n- Instagram: antes/despues visual y CTA corto.\n- Email: asunto directo, prueba y siguiente paso.\n\nModo demo activo: agrega OPENAI_API_KEY en Vercel para respuestas generadas por IA.`;
  }

  return `## Respuesta estrategica\n\nPara avanzar con **${topic}**, trabajaria en tres capas:\n\n1. **Oferta:** clarificar la promesa, el resultado y la prueba.\n2. **Embudo:** separar awareness, consideracion y conversion con KPIs propios.\n3. **Ejecucion:** lanzar pequenos experimentos semanales y duplicar solo lo que mida.\n\n**Proxima accion:** crea un brief con objetivo, publico, canal principal, presupuesto y CTA. Luego convierte ese brief en 3 piezas de copy y una secuencia de seguimiento.\n\nModo demo activo: agrega OPENAI_API_KEY en Vercel para respuestas generadas por IA.`;
}

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  const { message, history, context, mode = "chat" } = req.body || {};
  if (!cleanText(message, 12000) && !context) {
    return sendJson(res, 400, { error: "Missing message or context" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 200, {
      response: demoResponse({ message, mode, context }),
      mode: "demo",
      model: "demo",
    });
  }

  const payload = {
    model: CHAT_MODEL,
    instructions: SYSTEM_PROMPT,
    input: buildInput({ message, history, context, mode }),
    max_output_tokens: 1800,
  };

  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await openAiResponse.json().catch(() => ({}));

  if (!openAiResponse.ok) {
    return sendJson(res, openAiResponse.status, {
      error: openAiErrorMessage(data),
      mode: "error",
    });
  }

  return sendJson(res, 200, {
    response: extractOutputText(data),
    mode: "live",
    model: CHAT_MODEL,
  });
}
