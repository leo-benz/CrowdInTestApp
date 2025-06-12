'use server';

import React from 'react';
import Head from 'next/head';

/**
 * Describes a single string item that will be displayed in the preview.
 * Each preview item keeps the original text and the unique identifier that
 * helps React render a stable list.
 */
interface PreviewStringItem {
  text: string;
  id: number;
}

/**
 * A map of string keys (i.e. translation identifiers) to their corresponding
 * preview information. The key is the original string identifier, while the
 * value provides a human-readable `text` representation and an `id` used as
 * a React `key` when rendering lists.
 */
interface PreviewStrings {
  [key: string]: PreviewStringItem;
}

/**
 * Props accepted by the `FilePreview` React component.
 */
interface FilePreviewProps {
  fileName: string;
  strings: PreviewStrings;
}

/**
 * Presentational component that renders a basic HTML preview of the parsed
 * file. It shows the file name and a list of strings that were extracted
 * from the file for translation.
 *
 * The component is intentionally free of any business logic – it only knows
 * how to display the data that was already prepared by the server-side
 * parser.
 */
const FilePreview: React.FC<FilePreviewProps> = ({ fileName, strings }) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>Preview: {fileName}</title>
      </Head>
      <h1>File Preview: {fileName}</h1>
      {Object.keys(strings).length > 0 ? (
        <ul>
          {Object.entries(strings).map(([key, value]) => (
            <li key={value.id}>
              <strong>{key}:</strong> {value.text}
            </li>
          ))}
        </ul>
      ) : (
        <p>No strings to display.</p>
      )}
    </>
  );
};

export default FilePreview;
