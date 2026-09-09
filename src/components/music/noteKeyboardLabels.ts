export function getVisibleKeyLabel(
  label: string,
  labelKeys: boolean,
): string | null {
  return labelKeys ? label : null;
}
