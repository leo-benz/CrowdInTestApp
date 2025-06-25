import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import CrowdinApiClient from '@crowdin/crowdin-api-client';
import { getValidOrganizationToken } from '@/lib/crowdinAuth';

/**
 * Subset of the JWT payload we expect from Crowdin. Provided by a middleware
 * that decodes and verifies the token before reaching this handler.
 */
interface DecodedJwtPayload {
  domain: string;
  context: {
    organization_id: number;
    project_id?: number; // Optional because QA check JWTs don't have this
  };
  iat?: number;
  exp?: number;
}

/**
 * Extract organisation sub-domain (if any) from a Crowdin `baseUrl`.
 */
function getOrganizationDomain(baseUrl: string): string | undefined {
  try {
    const url = new URL(baseUrl);

    if (url.hostname.endsWith('.crowdin.com')) {
      return url.hostname.split('.')[0];
    }
  } catch (error) {
    console.error('Invalid baseUrl format:', baseUrl, error);
  }
  return undefined;
}

/**
 * Handle `GET /api/strings/[id]` request – fetch string data including custom fields
 * via Crowdin API. Requires a valid JWT (decoded by middleware) in the
 * `x-decoded-jwt` header.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decodedJwtString = request.headers.get('x-decoded-jwt');
  const { id: stringId } = await params;
  const projectIdParam = request.nextUrl.searchParams.get('projectId');

  if (!decodedJwtString) {
    console.error('Decoded JWT not found in headers. Middleware might not have run or failed.');
    return NextResponse.json(
      { error: { message: 'Authentication data not found.' } },
      { status: 500 }
    );
  }

  if (!stringId || isNaN(Number(stringId))) {
    return NextResponse.json(
      { error: { message: 'Invalid string ID provided.' } },
      { status: 400 }
    );
  }

  let decodedJwt: DecodedJwtPayload;
  try {
    decodedJwt = JSON.parse(decodedJwtString) as DecodedJwtPayload;
  } catch (error) {
    console.error('Failed to parse decoded JWT from headers:', error);
    return NextResponse.json(
      { error: { message: 'Invalid authentication data format.' } },
      { status: 500 }
    );
  }
  const organizationFromDb = await prisma.organization.findFirst({
    where: {
      domain: decodedJwt.domain,
      organizationId: Number(decodedJwt.context.organization_id),
    },
  });

  if (!organizationFromDb) {
    return NextResponse.json({ error: { message: 'Organization not found.' } }, { status: 404 });
  }

  try {
    const validAccessToken = await getValidOrganizationToken(organizationFromDb.id);
    const organizationDomain = getOrganizationDomain(organizationFromDb.baseUrl);

    const crowdinClient = new CrowdinApiClient({
      token: validAccessToken,
      ...(organizationDomain && { organization: organizationDomain }),
    });

    // Determine project ID - use from JWT context or query parameter
    const projectId =
      decodedJwt.context.project_id || (projectIdParam ? Number(projectIdParam) : undefined);

    if (!projectId) {
      return NextResponse.json(
        { error: { message: 'Project ID required but not found.' } },
        { status: 400 }
      );
    }

    // Fetch string data including custom fields
    const stringResponse = await crowdinClient.sourceStringsApi.getString(
      projectId,
      Number(stringId)
    );

    return NextResponse.json(stringResponse.data || {}, { status: 200 });
  } catch (error: unknown) {
    console.error('Error in GET /api/strings/[id]:', error);

    let errorMessage = 'An unknown error occurred.';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      if (
        errorMessage.includes('Organization not found') ||
        errorMessage.includes('Failed to refresh Crowdin token') ||
        errorMessage.includes('String not found') ||
        errorMessage.includes('Not Found')
      ) {
        statusCode = 404;
      }
    }

    return NextResponse.json({ error: { message: errorMessage } }, { status: statusCode });
  }
}
