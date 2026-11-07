import DOMPurify from "dompurify";
export function sanitizeHtml(value: string) {
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "div",
      "span",
      "b",
      "strong",
      "i",
      "em",
      "u",
      "h1",
      "h2",
      "h3",
      "blockquote",
      "ul",
      "ol",
      "li",
    ],
    ALLOWED_ATTR: [],
  });
}
export function textToHtml(value: string) {
  return value
    .split(/\r?\n/)
    .map(
      (line) =>
        `<p>${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") || "<br>"}</p>`,
    )
    .join("");
}
