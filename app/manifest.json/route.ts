import { NextResponse } from 'next/server';

/**
 * Serve the Crowdin **App Descriptor (manifest)** as a JSON response.
 *
 * The manifest tells Crowdin how to install and integrate the app:
 *   – identifier, name, logo
 *   – OAuth details (client id)
 *   – event web-hooks (installed / uninstall)
 *   – requested scopes
 *   – app modules (project-menu, custom file format, etc.)
 *
 * The route is automatically picked up by Next.js because it lives inside the
 * `app/manifest.json` folder and returns a `NextResponse` with `.json()`.
 */
export async function GET() {
  const manifestData = {
    identifier: 'getting-started-local',
    name: 'Getting Started Local',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    logo: '/logo.svg',
    authentication: {
      type: 'crowdin_app',
      clientId: process.env.CROWDIN_CLIENT_ID,
    },
    events: {
      installed: '/events/installed',
      uninstall: '/events/uninstall',
    },
    scopes: ['project'],
    modules: {
      'project-menu': [
        {
          key: 'menu',
          name: 'Getting Started Local',
          url: '/project-menu',
        },
      ],
      'editor-translations-panel': [
        {
          key: 'length-checker',
          name: 'Length Checker',
          modes: ['translate', 'review'],
          url: '/length-checker',
        },
      ],
      'editor-right-panel': [
        {
          key: 'length-checker-right-panel',
          name: 'Length Checker',
          modes: ['translate', 'review'],
          url: '/length-checker',
        },
      ],
      'custom-file-format': [
        {
          key: 'custom-file-format',
          type: 'custom-file-format',
          url: '/api/file/process',
          signaturePatterns: {
            fileName: '.+\\.json$',
            fileContent: '"hello_world":',
          },
        },
      ],
      'external-qa-check': [
        {
          key: 'text-length-qa-check',
          name: 'Text Length QA Check',
          runQaCheckUrl: '/api/qa/text-length-check',
          getBatchSizeUrl: '/api/qa/batch-size',
        },
      ],
    },
  };

  return NextResponse.json(manifestData);
}
