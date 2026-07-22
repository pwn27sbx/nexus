import type { APIRoute } from 'astro';
import { API_BASE_URL } from '../../utils/constants';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { toolId } = body;

    if (!toolId) {
      return new Response(JSON.stringify({ error: 'Missing toolId' }), { status: 400 });
    }

    // In a real scenario, we'd hit the Payload API to increment the clicks.
    // Since Payload doesn't have a direct "increment" endpoint, we need to fetch the current value, increment it, and update.
    // Or we can create a custom endpoint in Payload. Let's create a custom endpoint in Payload instead.
    // For now, we'll proxy the request to the Payload custom endpoint we will create.

    const response = await fetch(`${API_BASE_URL}/api/tools/${toolId}/track-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
