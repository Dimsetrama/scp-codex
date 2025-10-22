import React from 'react';

// Helper functions (no change)
const getScpUrl = (number: string) => `http://scp-wiki.wikidot.com/scp-${number.padStart(3, '0')}`;
const getTaleUrl = (title: string) => `http://scp-wiki.wikidot.com/${title.toLowerCase().replace(/ /g, '-').replace(/[?:!'.]/g, '')}`;

export const FormattedText = ({ text }: { text: string }) => {
  const scpRegex = /(SCP-\d+)/g;
  const taleRegex = /(\* ")([^"]+)(")/g;

  // FIX: Added keys to all generated elements to resolve the React error.
  const parts = text
    .split(scpRegex)
    .flatMap((part, i) => {
      if (i % 2 === 1) { // This part is an SCP number
        const scpNumber = part.split('-')[1];
        return (
          <a key={`scp-${i}`} href={getScpUrl(scpNumber)} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        );
      }
      return part.split(taleRegex).map((subPart, j) => {
        if (j % 4 === 2) { // This part is a Tale title
          return (
            <a key={`tale-${i}-${j}`} href={getTaleUrl(subPart)} target="_blank" rel="noopener noreferrer">
              {`* "${subPart}"`}
            </a>
          );
        }
        // Return text nodes wrapped in a fragment with a key
        return <React.Fragment key={`text-${i}-${j}`}>{j % 4 === 0 ? subPart : ''}</React.Fragment>;
      });
    });

  // FIX: The padding is now on this parent <p> tag to prevent clipping.
  return <p className="whitespace-pre-wrap pl-4 sm:pl-6 py-2">{parts}</p>; // Use pl- (padding-left) ONLY
};