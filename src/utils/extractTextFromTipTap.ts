
export function extractTextFromTipTapJSON(json: any): string {
  try {
    const node = typeof json === 'string' ? JSON.parse(json) : json;
    let text = '';

    const walk = (n: any) => {
      if (!n) return;
      if (n.type === 'text' && n.text) {
        text += n.text + ' ';
      }
      if (Array.isArray(n.content)) {
        n.content.forEach(walk);
      }
    };

    walk(node);
    return text.trim();
  } catch {
    return '';
  }
}
