import type { Page } from "@playwright/test";

export async function textContrastIssues(page: Page) {
  return page.evaluate(() => {
    const rgb = (value: string) => {
      const values = value.match(/[\d.]+/g)?.map(Number) || [0, 0, 0];
      return [values[0], values[1], values[2], values[3] ?? 1];
    };
    const blend = (top: number[], bottom: number[]) =>
      top
        .slice(0, 3)
        .map((value, i) => value * top[3] + bottom[i] * (1 - top[3]));
    const luminance = (color: number[]) =>
      color
        .slice(0, 3)
        .map((value) => {
          const c = value / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        })
        .reduce(
          (sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i],
          0,
        );
    return Array.from(document.querySelectorAll<HTMLElement>("body *")).flatMap(
      (element) => {
        if (
          ["SCRIPT", "STYLE", "OPTION", "OPTGROUP"].includes(element.tagName) ||
          element.closest(
            "svg, .sr-only, [aria-hidden=true], [disabled], nextjs-portal",
          ) ||
          !element.checkVisibility({
            checkOpacity: true,
            checkVisibilityCSS: true,
          })
        )
          return [];
        const text = Array.from(element.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent?.trim())
          .join(" ")
          .trim();
        if (!text) return [];
        const style = getComputedStyle(element);
        const ancestors = [];
        let parent: HTMLElement | null = element;
        while (parent) {
          ancestors.unshift(parent);
          parent = parent.parentElement;
        }
        let background = [255, 255, 255];
        for (const ancestor of ancestors)
          background = blend(
            rgb(getComputedStyle(ancestor).backgroundColor),
            background,
          );
        const foreground = blend(rgb(style.color), background);
        const l1 = luminance(foreground),
          l2 = luminance(background);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        const large =
          parseFloat(style.fontSize) >= 24 ||
          (parseFloat(style.fontSize) >= 18.66 &&
            parseInt(style.fontWeight) >= 700);
        return ratio + 0.01 < (large ? 3 : 4.5)
          ? [
              {
                text: text.slice(0, 85),
                ratio: Number(ratio.toFixed(2)),
                classes: element.className,
              },
            ]
          : [];
      },
    );
  });
}
