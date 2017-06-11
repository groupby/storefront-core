import { Request, SelectedRangeRefinement, SelectedRefinement, SelectedValueRefinement } from 'groupby-api';
import * as queryString from 'query-string';
import * as URI from 'urijs';
import UrlBeautifier from '..';
import { UrlParser } from '../handler';

export default class SearchUrlParser extends UrlParser<UrlBeautifier.SearchRequest> {

  suffixPattern: RegExp = RegExp(`${this.config.suffix}$`);

  parse = (url: string): UrlBeautifier.SearchRequest => {
    const uri = URI.parse(url);
    const path = uri.path.replace(this.suffixPattern, '')
      .split('/').filter((val) => val);

    const query = this.config.useReferenceKeys
      ? this.parsePathWithReferenceKeys(path)
      : SearchUrlParser.parsePathWithoutReferenceKeys(path);

    const queryVariables = queryString.parse(uri.query);

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

    return <UrlBeautifier.SearchRequest>query;
  }

  parsePathWithReferenceKeys(path: string[]): Partial<UrlBeautifier.SearchRequest> {
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

    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === this.config.queryToken) {
        query = SearchUrlParser.decode(path[i]);
      } else {
        refinements.push(...SearchUrlParser.extractRefinements(path[i], map[keys[i]]));
      }
    }

    return { query, refinements };
  }

  generateRefinementMapping() {
    return this.config.refinementMapping.reduce((map, mapping) => Object.assign(map, mapping), {});
  }

  static parsePathWithoutReferenceKeys(path: string[]): Partial<UrlBeautifier.SearchRequest> {
    const refinements = [];
    let query;

    if (path.length % 2 === 1) {
      query = SearchUrlParser.decode(path.shift());
    }

    while (path.length) {
      const value = SearchUrlParser.decode(path.shift());
      const navigationName = path.shift();
      refinements.push({ navigationName, type: 'Value', value });
    }

    return { query, refinements };
  }

  static extractUnmapped(refinementString: string): SelectedRefinement[] {
    return refinementString.split('~')
      .map(SearchUrlParser.decode)
      .map((refinement) => {
        const [navigationName, value] = refinement.split(':');
        if (value.indexOf('..') >= 0) {
          const [low, high] = value.split('..');
          return <SelectedRangeRefinement>{ navigationName, low: Number(low), high: Number(high), type: 'Range' };
        } else {
          return <SelectedValueRefinement>{ navigationName, value, type: 'Value' };
        }
      });
  }

  static extractRefinements(refinementString: string, navigationName: string) {
    const refinementStrings = refinementString.split('~');

    return refinementStrings.map((value) => ({ navigationName, type: 'Value', value: SearchUrlParser.decode(value) }));
  }

  static decode(value: string): string {
    return decodeURIComponent(value.replace(/-/g, ' '));
  }
}
