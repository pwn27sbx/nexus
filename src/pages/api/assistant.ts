import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return new Response(JSON.stringify({ error: 'No transcript provided' }), { status: 400 });
    }

    const apiKey = import.meta.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'Falta la clave API de Gemini. Por favor configúrala en tu archivo .env.',
        }),
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Eres un asistente de búsqueda inteligente para un directorio de recursos web (herramientas, diseño, desarrollo, IA).
El usuario dijo el siguiente comando de voz: "${transcript}"

Tu objetivo es deducir qué herramientas o categorías está buscando el usuario y devolver UNICAMENTE una cadena de búsqueda (keywords) optimizada para el motor de búsqueda (Algolia). 
Por ejemplo, si dice "soy estudiante de finanzas", devuelve "calculadora finanzas excel hojas".
Si dice "quiero hacer un logo animado", devuelve "logo animación svg".
No incluyas explicaciones, saludos ni comillas. Solo las palabras clave separadas por espacio.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const searchKeywords = response.text().trim();

    return new Response(
      JSON.stringify({
        keywords: searchKeywords,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Hubo un error procesando tu solicitud con la IA.',
      }),
      { status: 500 }
    );
  }
};
