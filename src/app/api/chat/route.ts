import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, history } = body;

    const backendUrl = process.env.CONCIERGE_API_URL || 'http://127.0.0.1:8100';
    
    const response = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        history: history || [],
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with concierge service' },
      { status: 500 }
    );
  }
}
