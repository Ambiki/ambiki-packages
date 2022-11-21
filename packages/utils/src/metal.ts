// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEmpty(value: any): boolean {
  if (value === null) return true;

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const key in value) {
    if (Object.hasOwnProperty.call(value, key)) {
      return false;
    }
  }

  return true;
}
