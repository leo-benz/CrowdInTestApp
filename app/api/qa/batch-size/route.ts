import { NextResponse } from 'next/server';

interface BatchSizeResponse {
  data: {
    size: number;
  };
}

export async function GET() {
  try {
    // JWT verification is handled by middleware
    // Return batch size for QA checks (how many translations per batch)
    const response: BatchSizeResponse = {
      data: {
        size: 50,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`[QA] Batch size error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
