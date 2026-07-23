import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { audio, text } = body;

    const apiKey = import.meta.env.GROQ_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            'Falta la clave API de Groq. Por favor configúrala en tu archivo .env (GROQ_API_KEY).',
        }),
        { status: 500 }
      );
    }

    let transcripcionFinal = text || '';

    // 1. Si recibimos audio (Fallback de Firefox/Brave), transcribimos con Whisper
    if (audio && audio.base64) {
      const mime = (audio.mimeType || 'audio/webm').split(';')[0];
      const ext = mime.split('/')[1] || 'webm';

      // Usar Buffer de Node.js es 100% seguro contra corrupción de archivos binarios
      const buffer = Buffer.from(audio.base64, 'base64');
      const blob = new Blob([buffer], { type: mime });

      const formData = new FormData();
      formData.append('file', blob, `audio.${ext}`);
      // Usar el modelo grande (más preciso para español que el turbo)
      formData.append('model', 'whisper-large-v3');
      formData.append('response_format', 'json');
      formData.append('language', 'es');
      // Añadir un prompt ayuda enormemente a Whisper a no alucinar "Thank you" con el ruido de fondo
      formData.append(
        'prompt',
        'El usuario está hablando en español sobre programación, diseño web y herramientas.'
      );

      const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!whisperRes.ok) {
        const errorText = await whisperRes.text();
        throw new Error(`Whisper Error: ${whisperRes.status} - ${errorText}`);
      }

      const whisperData = await whisperRes.json();
      transcripcionFinal = whisperData.text;
      console.log('[Groq] Transcripción Whisper:', transcripcionFinal);
    }

    if (!transcripcionFinal || transcripcionFinal.trim() === '') {
      return new Response(JSON.stringify({ keywords: '', transcripcion: '' }), { status: 200 });
    }

    // 2. Extraer palabras clave con Llama-3.1 (Aplica tanto a Audio como a Texto Nativo)
    const prompt = `
Eres un experto asistente de búsqueda para un directorio de recursos web (herramientas, diseño, desarrollo, IA).
El usuario busca lo siguiente (puede estar en español u otro idioma): "${transcripcionFinal}"

Tu objetivo es extraer las palabras clave (keywords) en INGLÉS (o los nombres exactos de las herramientas o tecnologías) que mejor coincidan con esta búsqueda. 
La base de datos del directorio está en inglés, por lo que debes traducir y deducir la intención.

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "keywords": "palabra1 palabra2 palabra3"
}

Ejemplo 1:
Búsqueda: "quiero crear una landing page con animaciones en javascript recomiendame"
Respuesta: {"keywords": "animation javascript landing page web animejs"}

Ejemplo 2:
Búsqueda: "busco inspiración para sitios web"
Respuesta: {"keywords": "inspiration web design ui"}

Reglas:
- No incluyas bloques de código markdown, responde SOLO con las llaves del JSON { y }.
`;

    const chatRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!chatRes.ok) {
      const errorText = await chatRes.text();
      throw new Error(`Llama Error: ${chatRes.status} - ${errorText}`);
    }

    const chatData = await chatRes.json();
    let responseText = chatData.choices[0].message.content.trim();

    // Clean potential markdown just in case Llama outputs it despite instructions
    if (responseText.startsWith('```')) {
      responseText = responseText
        .replace(/^```(json)?/, '')
        .replace(/```$/, '')
        .trim();
    }

    let searchKeywords = '';
    try {
      const dataObj = JSON.parse(responseText);
      searchKeywords = dataObj.keywords || '';
      console.log('[Groq] Keywords generadas por Llama:', searchKeywords);
    } catch (e) {
      console.error('Error parseando JSON de Llama:', responseText);
      searchKeywords = responseText;
    }

    return new Response(
      JSON.stringify({
        keywords: searchKeywords,
        transcripcion: transcripcionFinal,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Groq API Error:', error);

    if (error.message && error.message.includes('429')) {
      return new Response(
        JSON.stringify({
          error: 'Demasiadas peticiones a Groq en este momento. Intenta de nuevo.',
        }),
        { status: 429 }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Error procesando solicitud con Groq' }),
      { status: 500 }
    );
  }
};
