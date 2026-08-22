/** GA4 measurement IDs look like `G-XXXXXXXXXX`. */
export const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/i;

export function isValidGaMeasurementId(id: string): boolean {
  return GA_MEASUREMENT_ID_PATTERN.test(id);
}

export function getGaMeasurementId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!id || !isValidGaMeasurementId(id)) return undefined;
  return id;
}
