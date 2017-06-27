import UrlBeautifier from '.';

export abstract class UrlHandler {

  config: UrlBeautifier.Configuration = this.beautifier.config;

  constructor(protected beautifier: UrlBeautifier) { }

  static toKeys(mapping: any[]) {
    return mapping.reduce((map, singleMapping) => {
      const key = Object.keys(singleMapping)[0];
      return Object.assign(map, { [singleMapping[key]]: key });
    }, {});
  }

  static toObject(mapping: any[]) {
    return mapping.reduce((map, singleMapping) => {
      return Object.assign(map, singleMapping);
    }, {});
  }
}

export abstract class UrlParser<T> extends UrlHandler implements UrlBeautifier.Parser<T> {

  abstract parse: (url: string) => T;
}

export abstract class UrlGenerator<T> extends UrlHandler implements UrlBeautifier.Generator<T> {

  abstract build: (request: T) => string;
}
