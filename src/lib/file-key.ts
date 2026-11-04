// Klíč souboru v UploadThingu je poslední část URL za "/f/" (např. https://<app-id>.ufs.sh/f/<klíč>).
// Nespoléháme na konkrétní subdoménu, aby mazání fungovalo i pro starší soubory z utfs.io.
export function extractFileKey(url: string) {
  const marker = "/f/";
  const index = url.lastIndexOf(marker);
  return index === -1 ? url : url.slice(index + marker.length);
}
