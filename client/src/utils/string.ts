import type { ReactNode } from "react";
import { createElement } from "react";

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
};

export const stripHtml = (html: string): string => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const highlightText = (text: string, query: string): string => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(
    regex,
    '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>',
  );
};

// URL regex pattern to detect links
const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi;

/**
 * Convert text containing URLs into React elements with clickable links
 */
export const linkifyText = (text: string): ReactNode => {
  if (!text) return text;

  const parts = text.split(URL_REGEX);

  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    if (URL_REGEX.test(part)) {
      // Reset regex lastIndex since we're using global flag
      URL_REGEX.lastIndex = 0;
      return createElement(
        "a",
        {
          key: index,
          href: part,
          target: "_blank",
          rel: "noopener noreferrer",
          className:
            "text-blue-600 dark:text-blue-400 hover:underline break-all",
          onClick: (e: React.MouseEvent) => e.stopPropagation(),
        },
        part,
      );
    }
    return part;
  });
};
