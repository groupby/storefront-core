import UrlBeautifier from '.';

export abstract class UrlHandler {

  config: UrlBeautifier.Configuration = this.beautifier.config;

  constructor(protected beautifier: UrlBeautifier) { }

  get keysToRefinements() {
    return this.config.refinementMapping.reduce((map, mapping) => {
      const key = Object.keys(mapping)[0];
      return Object.assign(map, { [key]: mapping[key] });
    }, {});
  }

  get refinementsToKeys() {
    return this.config.refinementMapping.reduce((map, mapping) => {
      const key = Object.keys(mapping)[0];
      return Object.assign(map, { [mapping[key]]: key });
    }, {});
  }
}

export abstract class UrlParser<T> extends UrlHandler implements UrlBeautifier.Parser<T> {

  abstract parse: (url: string) => T;
}

export abstract class UrlGenerator<T> extends UrlHandler implements UrlBeautifier.Generator<T> {

  abstract build: (request: T) => string;
}
