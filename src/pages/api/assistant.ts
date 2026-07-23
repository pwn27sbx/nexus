import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { audio } = await request.json();

    if (!audio || !audio.base64) {
      return new Response(JSON.stringify({ error: 'No audio provided' }), { status: 400 });
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
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `
Eres un experto asistente de búsqueda para un directorio de recursos web (herramientas, diseño, desarrollo, IA).
Escucha atentamente el siguiente audio. El usuario está hablando en Español.

Paso 1: Transcribe exactamente lo que dice el usuario. Si hay ruido, trata de aislar la voz.
Paso 2: Deduce la intención de búsqueda principal.
Paso 3: Genera una lista de palabras clave (keywords) separadas por espacio, ideales para buscar en el directorio.

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "transcripcion": "lo que dijo el usuario palabra por palabra",
  "keywords": "palabra1 palabra2 palabra3"
}

Ejemplo 1:
Audio dice: "quiero crear una landing page con animaciones en javascript recomiendame"
Respuesta: {"transcripcion": "quiero crear una landing page con animaciones en javascript recomiendame", "keywords": "animaciones javascript landing page web"}

Ejemplo 2:
Audio dice: "busco inspiración para sitios web"
Respuesta: {"transcripcion": "busco inspiración para sitios web", "keywords": "inspiración diseño web ui"}

Reglas:
- Si el audio es puro ruido, ininteligible o vacío, devuelve {"transcripcion": "", "keywords": ""}
- No incluyas bloques de código markdown, responde SOLO con las llaves del JSON { y }.
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: (audio.mimeType || 'audio/webm').split(';')[0],
          data: audio.base64,
        },
      },
    ]);

    const response = await result.response;
    let responseText = response.text().trim();

    // Clean up potential markdown formatting from the AI response
    if (responseText.startsWith('`\``')) {
      responseText = responseText
        .replace(/^`\``(json)?/, '')
        .replace(/`\``$/, '')
        .trim();
    }

    let searchKeywords = '';
    let transcripcionFinal = '';
    try {
      const dataObj = JSON.parse(responseText);
      searchKeywords = dataObj.keywords || '';
      transcripcionFinal = dataObj.transcripcion || '';
      console.log('IA transcribió:', transcripcionFinal);
    } catch (e) {
      console.error('Error parseando JSON de IA:', responseText);
      searchKeywords = responseText; // Fallback in case it ignored JSON
    }

    return new Response(
      JSON.stringify({
        keywords: searchKeywords,
        transcripcion: transcripcionFinal,
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

    // Si el error es por límite de cuota (Rate Limit)
    if (error.message && error.message.includes('429')) {
      return new Response(
        JSON.stringify({
          error:
            'Demasiadas personas están usando la búsqueda por voz en este momento. Por favor, intenta de nuevo en 30 segundos.',
        }),
        { status: 429 }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Hubo un error procesando tu solicitud con la IA. Intenta de nuevo.',
      }),
      { status: 500 }
    );
  }
};
