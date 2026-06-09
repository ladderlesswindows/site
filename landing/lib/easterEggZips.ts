/** Hidden ZIP — not in zipRegistry or home ZIP buttons */
export const MOM_EASTER_EGG_ZIP = '79510';

export const MOM_EASTER_EGG_HEADLINE =
  'Great News Mom, only your home is covered in this zip-code, but scheduling may be tricky.';

export function isMomEasterEggZip(zip: string): boolean {
  return zip.trim() === MOM_EASTER_EGG_ZIP;
}

export const MOM_EASTER_EGG_PATH = '/booking/mom';

export function bookingFlowHref(
  basePath: string,
  step: '' | 'address' | 'success',
  query?: string
): string {
  const path = step ? `${basePath}/${step}` : basePath;
  return query ? `${path}?${query}` : path;
}