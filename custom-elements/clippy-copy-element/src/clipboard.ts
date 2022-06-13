export function copyText(text: string): Promise<void> {
  if ('clipboard' in navigator) {
    return navigator.clipboard.writeText(text);
  }

  fakeCopy(text);
  return Promise.resolve();
}

export function copyNode(target: HTMLElement): Promise<void> {
  const text = extractText(target);
  if ('clipboard' in navigator) {
    // Clear out the selection made by `extractText`
    const selection = getSelection();
    selection?.removeAllRanges();
    return navigator.clipboard.writeText(text);
  }

  fakeCopy(text);
  return Promise.resolve();
}

function fakeCopy(text: string) {
  const node = document.createElement('pre');
  node.style.width = '1px';
  node.style.height = '1px';
  node.style.position = 'fixed';
  node.style.top = '50%';
  node.textContent = text;

  document.body.append(node);
  extractText(node);
  document.execCommand('copy');
  document.body.removeChild(node);
}

function extractText(element: HTMLElement): string {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    return element.value;
  }

  const selection = getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  if (!selection) return '';

  selection.removeAllRanges();
  selection.addRange(range);

  return selection.toString();
}
