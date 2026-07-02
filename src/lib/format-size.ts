export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1000) {
    return `${Math.ceil(kb)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}
