import { Store } from '@storefront/flux-capacitor';
import * as URLparse from 'url-parse';
import UrlBeautifier from '..';
import { UrlParser } from '../handler';
import * as utils from '../utils';

export default class SearchUrlParser extends UrlParser<UrlBeautifier.SearchUrlState> {

  suffixPattern: RegExp = RegExp(`${this.config.suffix}$`);

  parse = (url: string): UrlBeautifier.SearchUrlState => {
    const uri = URLparse(url, true);
    const path = uri.pathname.replace(this.suffixPattern, '')
      .split('/').filter((val) => val);

    const query = this.config.useReferenceKeys
      ? this.parsePathWithReferenceKeys(path)
      : SearchUrlParser.parsePathWithoutReferenceKeys(path);

    const queryVariables = uri.query;
    const refinements = queryVariables[this.config.params.refinements];
    if (refinements) {
      query.refinements.push(...SearchUrlParser.extractUnmapped(refinements));
    }

    const pageSize = parseInt(queryVariables[this.config.params.pageSize]);
    if (pageSize) {
      query.pageSize = pageSize;
    }

    const page = parseInt(queryVariables[this.config.params.page]);
    if (page) {
      query.page = page;
    }

    const sort = queryVariables[this.config.params.sort];
    if (sort) {
      query.sort = SearchUrlParser.extractSort(sort);
    }

    const collection = queryVariables[this.config.params.collection];
    if (collection) {
      query.collection = collection;
    }

    return <UrlBeautifier.SearchUrlState>query;
  }

  parsePathWithReferenceKeys(path: string[]): Partial<UrlBeautifier.SearchUrlState> {
    const keys = (path.pop() || '').split('');
    const refinements = [];
    let query;

    if (path.length < keys.length) {
      throw new Error('token reference is invalid');
    }

    const map = this.generateRefinementMapping();
    keys.forEach((key) => {
      if (!(key in map || key === this.config.queryToken)) {
        throw new Error(`unexpected token '${key}' found in reference`);
      }
    });

    // remove prefixed paths
    path.splice(0, path.length - keys.length);

    // set query
    if (keys[0] === this.config.queryToken) {
      query = utils.decodeChars(path[0]);
      keys.shift();
      path.shift();
    }

    for (let i = 0; i < keys.length; i++) {
      refinements.push(SearchUrlParser.extractValueRefinements(map[keys[i]], path[i]));
    }

    return { query, refinements };
  }

  generateRefinementMapping() {
    return this.config.refinementMapping.reduce((map, mapping) => Object.assign(map, mapping), {});
  }

  static parsePathWithoutReferenceKeys(path: string[]): Partial<UrlBeautifier.SearchUrlState> {
    const refinements = [];
    let query;

    if (path.length % 2 === 1) {
      query = utils.decodeChars(path.shift());
    }

    while (path.length) {
      const value = utils.decodeChars(path.shift());
      const field = path.shift();
      refinements.push(SearchUrlParser.extractValueRefinements(field, value));
    }

    return { query, refinements };
  }

  static extractUnmapped(refinementString: string): UrlBeautifier.Refinement[] {
    return utils.decodeArray(refinementString)
      .map(([field, value]) => {
        if (typeof value === 'string') {
          return SearchUrlParser.extractValueRefinements(field, value);
        } else {
          return SearchUrlParser.extractRangeRefinements(field, value[0], value[1]);
        }
      });
  }

  static extractValueRefinements(field: string, value: string) {
    return { field: utils.decodeChars(field), value: utils.decodeChars(value) };
  }

  static extractRangeRefinements(field: string, low: number, high: number) {
    return { field: utils.decodeChars(field), low, high };
  }

  static extractSort(sortString: string) {
    const [[field, descending]] = utils.decodeArray(sortString);

    return { field, descending: JSON.parse(descending) };
  }
}
