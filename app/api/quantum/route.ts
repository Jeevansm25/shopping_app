import { NextRequest, NextResponse } from "next/server";

const QUANTUM_SERVICE_URL = 'http://127.0.0.1:5000';

export async function POST(req: NextRequest) {
  try {
    const { operation, params } = await req.json();

    let endpoint = '';
    switch (operation) {
      case 'random':
        endpoint = '/quantum/random';
        break;
      case 'flip':
        endpoint = '/quantum/flip';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }

    const response = await fetch(`${QUANTUM_SERVICE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params || {}),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Quantum service error:', errorData);
      throw new Error(`Quantum service error: ${errorData}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Quantum API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute quantum operation' },
      { status: 500 }
    );
  }
} 