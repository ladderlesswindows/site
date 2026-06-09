/** Territory photo in /public named by the last two digits of the ZIP (e.g. 95060 → template60.jpg). */
export function getZipTemplateImageSrc(zip: string): string | null {
  const digits = zip.replace(/\D/g, "");
  if (digits.length < 2) return null;
  return `/template${digits.slice(-2)}.jpg`;
}