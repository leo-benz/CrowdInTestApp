import { NextResponse, NextRequest } from 'next/server';
import { parseFile, buildFile } from '@/lib/fileProcessing';
import { TranslationEntry } from '@/lib/file-utils/types';

/**
 * Supported job types for the file processing endpoint.
 */
type JobType = 'parse-file' | 'build-file';

/**
 * Request body definition expected by the `/api/file/process` endpoint.
 */
interface ProcessRequestBody {
  jobType: JobType | unknown;
  file: { content?: string; contentUrl?: string; name: string };
  targetLanguages: { id: string }[];
  strings?: TranslationEntry[];
  stringsUrl?: string;
}

const validateCommonFields = (body: ProcessRequestBody): { isValid: boolean; error?: string } => {
  if (!body.file) {
    return { isValid: false, error: 'File is missing in request' };
  }

  if (!body.file.name) {
    return { isValid: false, error: 'File name is missing' };
  }

  if (!(body.file.content || body.file.contentUrl)) {
    return { isValid: false, error: 'File content or URL is missing' };
  }

  return { isValid: true };
};

const validateBuildFileRequest = (
  body: ProcessRequestBody
): { isValid: boolean; error?: string } => {
  if (!(body.strings || body.stringsUrl)) {
    return { isValid: false, error: 'For build-file, you need to provide strings or stringsUrl' };
  }

  return { isValid: true };
};

const handleParseFile = async (body: ProcessRequestBody) => {
  const validation = validateCommonFields(body);
  if (!validation.isValid) {
    return NextResponse.json({ error: { message: validation.error } }, { status: 400 });
  }

  const response = await parseFile({
    file: body.file,
    targetLanguages: body.targetLanguages,
  });

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
};

const handleBuildFile = async (body: ProcessRequestBody) => {
  const commonValidation = validateCommonFields(body);
  if (!commonValidation.isValid) {
    return NextResponse.json({ error: { message: commonValidation.error } }, { status: 400 });
  }

  const buildValidation = validateBuildFileRequest(body);
  if (!buildValidation.isValid) {
    return NextResponse.json({ error: { message: buildValidation.error } }, { status: 400 });
  }

  // Create proper request object with correct types
  const buildRequest: {
    file: { content?: string; contentUrl?: string; name: string };
    targetLanguages: { id: string }[];
    strings?: TranslationEntry[];
    stringsUrl?: string;
  } = {
    file: body.file,
    targetLanguages: body.targetLanguages,
  };

  // Only add strings if it exists
  if (body.strings) {
    buildRequest.strings = body.strings;
  }

  // Only add stringsUrl if it exists
  if (body.stringsUrl) {
    buildRequest.stringsUrl = body.stringsUrl;
  }

  const response = await buildFile(buildRequest);

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Primary entry point – decide which file operation to perform based on
 * `jobType` and delegate to the corresponding handler.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ProcessRequestBody;

    if (!body.jobType) {
      return NextResponse.json(
        { error: { message: 'Missing jobType parameter in request' } },
        { status: 400 }
      );
    }

    switch (body.jobType) {
      case 'parse-file':
        return await handleParseFile(body);

      case 'build-file':
        return await handleBuildFile(body);

      default:
        const jobTypeMessage = typeof body.jobType === 'string' ? body.jobType : 'unknown type';
        return NextResponse.json(
          { error: { message: `Unknown job type: ${jobTypeMessage}` } },
          { status: 400 }
        );
    }
  } catch (e: unknown) {
    console.error('Error processing file:', e);

    const errorMessage =
      e instanceof Error ? e.message : 'An unknown error occurred while processing the file';

    return NextResponse.json(
      {
        error: {
          message: errorMessage,
          stack: process.env.NODE_ENV === 'development' && e instanceof Error ? e.stack : undefined,
        },
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
