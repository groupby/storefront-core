export const RANGE_SEPARATOR = '..';
export const ARRAY_SEPARATOR = ',';
export const PAIR_SEPARATOR = ':';
export const RANGE_SEPARATOR_REGEX = /(^|[^.])\.{2}([^.]|$)/;

export function encodeArray(arr: Array<[string, any[]]>): string {
  return arr.reduce((refs, ref, index) => {
    refs.push(encodePair([ref[0], ref[1].join(RANGE_SEPARATOR)]));
    return refs;
  }, []).join(ARRAY_SEPARATOR);
}

export function decodeArray(input: string): any[] {
  return input.split(ARRAY_SEPARATOR)
    .map((val) => {
      let [field, valueOrRange] = decodePair(val);
      if (RANGE_SEPARATOR_REGEX.test(valueOrRange)) {
        valueOrRange = valueOrRange.split(RANGE_SEPARATOR).map((Number));
      }
      return [field, valueOrRange];
    });
}

export function encodePair(input: string[]): string {
  return input.join(PAIR_SEPARATOR);
}

export function decodePair(input: string): any[] {
  return input.split(PAIR_SEPARATOR);
}

export function encodeChars(input: string): string {
  return encodeURIComponent(input).replace(/-/g, '%252D').replace(/%20/g, '-');
}

export function decodeChars(input: string): string {
  return decodeURIComponent(input.replace(/-/g, ' ').replace(/%252D/g, '-'));
}
