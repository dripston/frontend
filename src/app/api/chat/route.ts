import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, history } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Missing "question" field' }, { status: 400 });
    }

    const backendUrl = process.env.CHAT_API_URL;

    const backendResponse = await fetch(`${backendUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        history: history || [],
      }),
    });

    if (!backendResponse.ok || !backendResponse.body) {
      return NextResponse.json(
        {
          error: `Backend returned ${backendResponse.status} ${backendResponse.statusText}`,
        },
        { status: 502 },
      );
    }

    // Pass the NDJSON stream straight through to the client instead of
    // buffering it with response.json(). This preserves the chunk-by-chunk
    // timing that makes the UI feel like it's actually streaming.
    return new NextResponse(backendResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no', // disable proxy buffering (e.g. nginx) if present
      },
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with concierge service' },
      { status: 500 },
    );
  }
}
