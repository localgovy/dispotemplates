import type { Product } from '../data/products';
import type { QuizAnswers } from '../data/aiQuiz';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

// Human-readable summary of quiz answers for the prompt
function summariseAnswers(answers: QuizAnswers): string {
  const effectMap: Record<string, string> = {
    relax: 'wants to relax and unwind',
    sleep: 'is looking for sleep support',
    energy: 'wants energy and focus',
    social: 'wants a social, euphoric experience',
    pain: 'is looking for pain and wellness relief',
    curious: 'is just exploring cannabis for the first time',
  };
  const formatMap: Record<string, string> = {
    smoke: 'prefers flower or pre-rolls',
    vape: 'prefers vaping',
    edible: 'prefers edibles or beverages',
    oral: 'prefers tinctures or capsules',
    any: 'has no format preference',
  };
  const expMap: Record<string, string> = {
    new: 'is new to cannabis',
    casual: 'is an occasional user',
    regular: 'is a regular user',
    advanced: 'has a high tolerance',
  };
  const budgetMap: Record<string, string> = {
    low: 'has a budget under $20',
    mid: 'has a budget of $20–$40',
    high: 'has a budget of $40–$60',
    any: 'has no budget limit',
  };
  return [
    effectMap[answers.effect] ?? answers.effect,
    formatMap[answers.format] ?? answers.format,
    expMap[answers.experience] ?? answers.experience,
    budgetMap[answers.budget] ?? answers.budget,
  ].join(', ');
}

function buildPrompt(answers: QuizAnswers, candidates: Product[]): string {
  const customerDesc = summariseAnswers(answers);

  const productList = candidates
    .map((p, i) => {
      const thc = p.thc !== null ? `THC ${p.thc}%` : '';
      const cbd = p.cbd !== null && p.cbd > 0.5 ? `CBD ${p.cbd}%` : '';
      const potency = [thc, cbd].filter(Boolean).join(', ');
      return `${i + 1}. ${p.name} by ${p.brand} (${p.category}${potency ? ' — ' + potency : ''}, $${p.price.toFixed(2)}) — ${p.description}`;
    })
    .join('\n');

  return `You are a friendly, knowledgeable specialist at Emerald Crypt in Ontario, Canada. A customer ${customerDesc}. Based on their profile, our system selected these products:\n\n${productList}\n\nWrite 2–3 warm, conversational sentences recommending these products to this specific customer. Mention 1–2 products by name. Only refer to products in this list — never invent or mention anything else. Keep it short and approachable.`;
}

export async function getRecommendationBlurb(
  answers: QuizAnswers,
  candidates: Product[],
): Promise<string | null> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey || candidates.length === 0) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful, friendly cannabis retail assistant. Keep recommendations brief (2–3 sentences). Only describe products explicitly provided to you.',
          },
          { role: 'user', content: buildPrompt(answers, candidates) },
        ],
        max_tokens: 160,
        temperature: 0.65,
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const json = await res.json();
    const text: string | undefined = json?.choices?.[0]?.message?.content;
    return text?.trim() ?? null;
  } catch {
    return null;
  }
}
