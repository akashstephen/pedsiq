import React from "react";

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseBoldSegments(text: string): React.ReactNode[] {
  const decoded = decodeHtmlEntities(text);
  const parts = decoded.split(/(<strong>.*?<\/strong>)/g);

  return parts.map((part, i) => {
    if (part.startsWith("<strong>") && part.endsWith("</strong>")) {
      const content = part.slice(8, -9);
      return (
        <strong key={i} className="font-bold text-white">
          {content}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

interface SafeHtmlProps {
  text: string;
  className?: string;
}

export function SafeHtml({ text, className = "" }: SafeHtmlProps) {
  return <span className={className}>{parseBoldSegments(text)}</span>;
}
