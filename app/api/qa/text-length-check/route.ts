import { NextRequest, NextResponse } from 'next/server';
import { measureTextWidth } from '@/lib/text-measurement';

interface Translation {
  id: number;
  text: string;
  stringId: number;
}

interface QARequest {
  data: {
    translations: Translation[];
    targetLanguage: {
      id: string;
      name: string;
    };
    sourceLanguage: {
      id: string;
      name: string;
    };
    project: {
      id: number;
      name: string;
    };
    file: {
      id: number;
      name: string;
    };
  };
}

interface QAValidation {
  translationId: number;
  passed: boolean;
  error?: {
    message: string;
  };
}

interface QAResponse {
  data: {
    validations: QAValidation[];
  };
}

async function getStringMaxLength(
  stringId: number,
  jwtToken: string,
  projectId: number
): Promise<number | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/strings/${stringId}?jwtToken=${jwtToken}&projectId=${projectId}`
    );
    if (!response.ok) {
      console.warn(`[QA] Failed to fetch string ${stringId} metadata: ${response.status}`);
      return null;
    }
    const data = await response.json();
    const maxWidth = data.fields?.widthpx || data.MaxWidthPixel || null;
    return maxWidth;
  } catch (error) {
    console.error(`[QA] Error fetching string ${stringId} metadata:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // JWT verification is handled by middleware
    // Get JWT token from headers or query params
    const authHeader = request.headers.get('authorization');
    let jwtToken: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      jwtToken = authHeader.substring(7);
    } else {
      jwtToken = request.nextUrl.searchParams.get('jwtToken');
    }

    if (!jwtToken) {
      return NextResponse.json({ error: 'JWT token required' }, { status: 401 });
    }

    const qaRequest: QARequest = await request.json();
    console.warn(
      `[QA] Processing ${qaRequest.data.translations.length} translations for project ${qaRequest.data.project.name} (${qaRequest.data.targetLanguage.id})`
    );

    const validations: QAValidation[] = [];

    for (const translation of qaRequest.data.translations) {
      const textWidth = measureTextWidth(translation.text);

      // Get project ID from QA request payload (as per Crowdin external QA check specification)
      const maxWidth = await getStringMaxLength(
        translation.stringId,
        jwtToken,
        qaRequest.data.project.id
      );

      if (maxWidth && textWidth > maxWidth) {
        const excess = textWidth - maxWidth;
        console.warn(
          `[QA] Translation ${translation.id} failed: ${textWidth}px exceeds ${maxWidth}px by ${excess}px`
        );
        validations.push({
          translationId: translation.id,
          passed: false,
          error: {
            message: `Translation text width (${textWidth}px) exceeds maximum allowed width (${maxWidth}px) by ${excess} pixels`,
          },
        });
      } else {
        validations.push({
          translationId: translation.id,
          passed: true,
        });
      }
    }

    const response: QAResponse = {
      data: {
        validations,
      },
    };

    const passedCount = validations.filter(v => v.passed).length;
    const failedCount = validations.filter(v => !v.passed).length;

    if (failedCount > 0) {
      console.warn(`[QA] Completed: ${passedCount} passed, ${failedCount} failed`);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error(`[QA] Error processing QA check:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
