import React from 'react';

interface HighlightTextProps {
  text: string | null | undefined;
  search: string;
  className?: string;
}

/**
 * Highlights all occurrences of `search` within `text` using a yellow background.
 */
export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  search,
  className = ''
}) => {
  if (!text) return null;
  if (!search || !search.trim()) {
    return <span className={className}>{text}</span>;
  }

  const query = search.trim();
  // Escape regex special characters
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.toLowerCase() === query.toLowerCase()) {
          return (
            <mark
              key={index}
              className="bg-yellow-300 text-slate-900 font-bold px-0.5 rounded shadow-xs"
            >
              {part}
            </mark>
          );
        }
        return part;
      })}
    </span>
  );
};

/**
 * Extracts a relevant snippet from full OCR text around the matching search term.
 */
export const getOcrSnippet = (
  ocrText: string | null | undefined,
  search: string,
  radius: number = 70
): string | null => {
  if (!ocrText || !search || !search.trim()) return null;

  const text = ocrText.replace(/\s+/g, ' ');
  const query = search.trim().toLowerCase();
  const index = text.toLowerCase().indexOf(query);

  if (index === -1) return null;

  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + query.length + radius);

  let snippet = text.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  return snippet;
};

/**
 * Checks if search term is present in any of the provided strings (case-insensitive).
 */
export const matchesQuery = (search: string, ...targets: (string | undefined | null)[]): boolean => {
  if (!search || !search.trim()) return true;
  const q = search.trim().toLowerCase();
  return targets.some(target => target && target.toLowerCase().includes(q));
};
