import { useEffect } from "react";

/**
 * Hook để chặn copy và bôi đen nội dung trang, chỉ cho phép trong các vùng được phép
 * @param allowedSelectors - CSS selectors của các vùng được phép copy/select
 */
export const useCopyProtection = (
  allowedSelectors: string[] = [
    ".note-content",
    ".copyable",
    "input",
    "textarea",
  ],
) => {
  useEffect(() => {
    // Chặn copy
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      const isAllowed = allowedSelectors.some(
        (selector) => target.closest(selector) !== null,
      );

      if (!isAllowed) {
        e.preventDefault();
      }
    };

    // Chặn bôi đen (selectstart)
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      const isAllowed = allowedSelectors.some(
        (selector) => target.closest(selector) !== null,
      );

      if (!isAllowed) {
        e.preventDefault();
      }
    };

    // Style CSS để chặn user-select
    const style = document.createElement("style");
    style.id = "copy-protection-style";
    style.textContent = `
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      .note-content, .copyable, input, textarea {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
    `;
    document.head.appendChild(style);

    document.addEventListener("copy", handleCopy);
    document.addEventListener("selectstart", handleSelectStart);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("selectstart", handleSelectStart);
      const existingStyle = document.getElementById("copy-protection-style");
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [allowedSelectors]);
};

export default useCopyProtection;
