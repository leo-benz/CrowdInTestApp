'use server';

import React from 'react';
import FilePreview from './FilePreview';
import {
  TranslationEntry,
  ParseFileRequest,
  BuildFileRequest,
  PreviewStrings,
} from './file-utils/types';
import { uploadToBlob, exceedsMaxSize, generateUniqueFileName } from './file-utils/blob-storage';
import { getContent, getStringsForExport, getTranslation } from './file-utils/content-processor';

/**
 * Processes the input file and generates strings for translation
 * @param req The request to analyze the file
 * @returns Strings for translation and HTML preview
 */
export async function parseFile(req: ParseFileRequest) {
  const fileContent = await getContent(req.file);
  const hasTargetLanguage = req.targetLanguages?.[0]?.id != null;

  const { sourceStrings, previewStrings } = extractStringsFromContent(
    fileContent,
    hasTargetLanguage && req.targetLanguages[0] ? req.targetLanguages[0].id : undefined
  );

  const previewHtml = await generatePreviewHtml(req.file.name || 'Unknown file', previewStrings);

  const fileBaseName = generateUniqueFileName(req.file.name);

  const serializedStrings = JSON.stringify(sourceStrings);
  if (!exceedsMaxSize(serializedStrings)) {
    return {
      data: {
        strings: sourceStrings,
        preview: Buffer.from(previewHtml).toString('base64'),
      },
    };
  }

  return {
    data: {
      stringsUrl: await uploadToBlob(
        serializedStrings,
        `parsed_files/${fileBaseName}_strings.json`,
        'application/json'
      ),
      previewUrl: await uploadToBlob(
        previewHtml,
        `parsed_files/${fileBaseName}_preview.html`,
        'text/html'
      ),
    },
  };
}

/**
 * Creates a file with translated strings
 * @param req The request to create a file
 * @returns File content or URL to download
 */
export async function buildFile(req: BuildFileRequest) {
  const languageId = req.targetLanguages?.[0]?.id;
  if (!languageId) {
    throw new Error('Target language ID is missing');
  }

  const fileContent = await getContent(req.file);
  const translations = await getStringsForExport(req);

  if (!fileContent || typeof fileContent !== 'object' || Object.keys(fileContent).length === 0) {
    throw new Error('No content to translate or invalid file content format');
  }

  const translatedContent = translateFileContent(fileContent, translations, languageId);

  const responseContent = JSON.stringify(translatedContent, null, 2);
  const fileBaseName = generateUniqueFileName(req.file.name);

  if (!exceedsMaxSize(responseContent)) {
    return {
      data: {
        content: Buffer.from(responseContent).toString('base64'),
      },
    };
  }

  return {
    data: {
      contentUrl: await uploadToBlob(
        responseContent,
        `built_files/${fileBaseName}_content.json`,
        'application/json'
      ),
    },
  };
}

/**
 * Extracts strings for translation from the file content
 * @param fileContent The file content
 * @param languageId The language ID (optional)
 * @returns Object with strings for translation and preview
 */
function extractStringsFromContent(
  fileContent: Record<string, string>,
  languageId?: string
): { sourceStrings: TranslationEntry[]; previewStrings: PreviewStrings } {
  const sourceStrings: TranslationEntry[] = [];
  const previewStrings: PreviewStrings = {};
  let previewIndex = 0;

  if (!fileContent || typeof fileContent !== 'object') {
    return { sourceStrings, previewStrings };
  }

  for (const key in fileContent) {
    const value = fileContent[key];
    if (typeof value !== 'string') {
      continue;
    }

    let entryTranslations: Record<string, { text: string }> = {};
    if (languageId) {
      entryTranslations = { [languageId]: { text: value } };
    }

    sourceStrings.push({
      identifier: key,
      context: `Some context: \n ${value}`,
      customData: '',
      previewId: previewIndex,
      labels: [],
      isHidden: false,
      text: value,
      translations: entryTranslations,
    });

    previewStrings[key] = {
      text: value,
      id: previewIndex,
    };
    previewIndex++;
  }

  return { sourceStrings, previewStrings };
}

/**
 * Generates HTML preview for the file
 * @param fileName The file name
 * @param previewStrings Strings for preview
 * @returns HTML code for preview
 */
async function generatePreviewHtml(
  fileName: string,
  previewStrings: PreviewStrings
): Promise<string> {
  try {
    const ReactDOMServer = (await import('react-dom/server')).default;
    return ReactDOMServer.renderToStaticMarkup(
      React.createElement(FilePreview, {
        fileName,
        strings: previewStrings,
      })
    );
  } catch (err) {
    console.error('Error rendering React preview:', err);
    return `<html><body><h1>Error rendering preview for ${fileName}</h1></body></html>`;
  }
}

/**
 * Translates the file content
 * @param fileContent The file content
 * @param translations Translations
 * @param languageId The language ID
 * @returns Translated file content
 */
function translateFileContent(
  fileContent: Record<string, string>,
  translations: TranslationEntry[],
  languageId: string
): Record<string, string> {
  const translatedContent = { ...fileContent };

  for (const key of Object.keys(translatedContent)) {
    if (typeof translatedContent[key] !== 'string') {
      continue;
    }
    translatedContent[key] = getTranslation(translations, key, languageId, translatedContent[key]);
  }

  return translatedContent;
}
