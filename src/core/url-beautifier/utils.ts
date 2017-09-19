export const RANGE_SEPARATOR = '..';
export const ARRAY_SEPARATOR = ',';
export const PAIR_SEPARATOR = ':';
export const SEPARATORS = [RANGE_SEPARATOR, ARRAY_SEPARATOR, PAIR_SEPARATOR];
export const ESCAPE_CHAR = '\\';

export function encodeArray(arr: Array<[string, any[]]>): string {
  return arr.reduce((refs, ref, index) => {
    refs.push(encodePair([ref[0], ref[1].join(RANGE_SEPARATOR)]));
    return refs;
  }, []).join(ARRAY_SEPARATOR);
}

export function decodeArray(input: string): any[] {
  return splitExceptEscaped(input, ARRAY_SEPARATOR)
    .map((val) => {
      const[field, valueOrRange] = decodePair(val);
      const split = splitExceptEscaped(valueOrRange, RANGE_SEPARATOR);
      return [field, split.length > 1 ? split.map(Number) : split[0]];
    });
}

export function encodePair(input: string[]): string {
  return input.join(PAIR_SEPARATOR);
}

export function decodePair(input: string): any[] {
  return splitExceptEscaped(input, PAIR_SEPARATOR);
}

export function encodeChars(input: string): string {
  return encodeURIComponent(input).replace(/-/g, '%252D').replace(/%20/g, '-');
}

export function decodeChars(input: string): string {
  return decodeURIComponent(input.replace(/-/g, ' ').replace(/%252D/g, '-'));
}

export function splitExceptEscaped(input: string, separator: string): any[] {
  let output = [];
  let buffer = '';

  for (let i = 0; i < input.length; i++) {
    // tslint:disable no-switch-case-fall-through
    switch (input[i]) {
      // if we do not hit a break we will just append the character at index i
      case ESCAPE_CHAR:
        if (input.substr(i + 1, separator.length) === separator) {
          buffer += separator;
          i += separator.length;
          break;
        }
      case separator[0]:
        if (input.substr(i, separator.length) === separator) {
          output.push(buffer);
          buffer = '';
          i += separator.length - 1;
          break;
        }
      default:
        buffer += input[i];
    }
    // tslint:enable no-switch-case-fall-through
  }
  if (buffer) {
    output.push(buffer);
  }
  return output;
}

export function escapeSeparators(input: string): string {
  return SEPARATORS.reduce((parsed, separator) =>
                           parsed.split(separator).join('\\' + separator),
                           input);
}
