// Keep this function self-contained: the native editor runs it inside its WebView.
export function prepareEditorBlocks(editor: HTMLElement) {
  const selection = editor.ownerDocument.defaultView?.getSelection();
  const anchor = selection?.anchorNode;
  const focus = selection?.focusNode;
  const anchorOffset = selection?.anchorOffset ?? 0;
  const focusOffset = selection?.focusOffset ?? 0;
  let changed = false;
  const blocks = new Set([
    "P",
    "DIV",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "UL",
    "OL",
    "BLOCKQUOTE",
    "PRE",
  ]);
  // Bare LI text makes formatBlock wrap the whole list in a heading in Chromium.
  // A paragraph gives the browser a real block to replace inside each list item.
  editor.querySelectorAll("li").forEach((item) => {
    let paragraph: HTMLParagraphElement | null = null;
    Array.from(item.childNodes).forEach((node) => {
      if (node.nodeType === 1 && blocks.has((node as Element).tagName)) {
        paragraph = null;
      } else {
        if (!paragraph) {
          paragraph = editor.ownerDocument.createElement("p");
          item.insertBefore(paragraph, node);
          changed = true;
        }
        paragraph.appendChild(node);
      }
    });
  });
  // Repair invalid wrappers left by older formatting commands, preserving text,
  // nested lists and the innermost heading level instead of multiplying sizes.
  Array.from(editor.querySelectorAll("h1,h2"))
    .reverse()
    .forEach((heading) => {
      if (!heading.querySelector("h1,h2,ul,ol")) return;
      heading.querySelectorAll("li").forEach((item) => {
        Array.from(item.children).forEach((block) => {
          if (
            !["P", "DIV"].includes(block.tagName) ||
            block.querySelector("h1,h2,ul,ol")
          )
            return;
          const replacement = editor.ownerDocument.createElement(
            heading.tagName.toLowerCase(),
          );
          while (block.firstChild) replacement.appendChild(block.firstChild);
          block.replaceWith(replacement);
        });
      });
      const parent = heading.parentNode;
      if (!parent) return;
      while (heading.firstChild)
        parent.insertBefore(heading.firstChild, heading);
      heading.remove();
      changed = true;
    });
  // Moving nodes invalidates live Ranges; restore the actual text endpoints.
  if (
    changed &&
    selection &&
    anchor &&
    focus &&
    editor.contains(anchor) &&
    editor.contains(focus)
  ) {
    const length = (node: Node) =>
      node.nodeType === 3
        ? (node.textContent?.length ?? 0)
        : node.childNodes.length;
    selection.setBaseAndExtent(
      anchor,
      Math.min(anchorOffset, length(anchor)),
      focus,
      Math.min(focusOffset, length(focus)),
    );
  }
}
