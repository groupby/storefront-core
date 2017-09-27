import { Store } from '@storefront/flux-capacitor';
import * as URLparse from 'url-parse';
import StoreFront from '../..';
import UrlService from '../../services/url';
import Configuration from '../configuration';
import BeautifierFactory from './factory';

class UrlBeautifier implements UrlBeautifier.SimpleBeautifier {

  beautifiers: UrlBeautifier.Beautifiers = BeautifierFactory.create(this);

  // tslint:disable-next-line max-line-length
  constructor(public routes: UrlService.Routes, public config: UrlBeautifier.Configuration, public appConfig: Configuration) {
    this.beautifiers = BeautifierFactory.create(this);

    const keys = [];
    for (let mapping of this.config.refinementMapping) {
      const key = Object.keys(mapping)[0];
      UrlBeautifier.validateToken(key, keys);
      keys.push(key);
    }
    UrlBeautifier.validateToken(this.config.queryToken, keys);
  }

  parse<T>(url: string): { route: string, request: T } {
    const uri = URLparse(url);
    const activeRoute = Object.keys(this.routes).find((route) => uri.pathname.startsWith(this.routes[route]));

    if (activeRoute) {
      // tslint:disable-next-line max-line-length
      return { route: activeRoute, request: this.beautifiers[activeRoute].parse(UrlBeautifier.extractAppRoute(uri, this.routes[activeRoute])) };
    } else {
      throw new Error('invalid route');
    }
  }

  build<T>(type: string, request: T) {
    if (type in this.routes) {
      return `${this.routes[type]}${this.beautifiers[type].build(request)}`;
    } else {
      throw new Error('invalid route');
    }
  }

  static validateToken(token: string, keys: string[]) {
    if (token.length !== 1) {
      throw new Error(`token '${token}' must be a single character`);
    } else if (token.match(/[aeiouy]/)) {
      throw new Error(`token '${token}' must not be a vowel`);
    } else if (keys.indexOf(token) > -1) {
      throw new Error(`token '${token}' must be unique`);
    }
  }

  static extractAppRoute({ query, pathname }: { query: string, pathname: string }, route: string) {
    return [pathname.substr(route.length), query].join('');
  }
}

namespace UrlBeautifier {
  export interface SimpleBeautifier {
    parse<T>(url: string): { route: string, request: T };
    build<T>(type: string, request: T);
  }

  export interface Factory {
    (app: StoreFront, routes: { [key: string]: string }): SimpleBeautifier;
  }

  export interface Configuration {
    refinementMapping?: any[];
    variantMapping?: any[];
    params?: {
      page?: string;
      pageSize?: string;
      refinements?: string;
      sort?: string;
      collection?: string;
    };
    queryToken?: string;
    suffix?: string;
    useReferenceKeys?: boolean;
    navigations?: any;
  }

  export interface Url {
    query: string;
    path: string;
  }

  export interface SearchUrlState {
    query?: string;
    page: number;
    pageSize: number;
    refinements: Refinement[];
    sort: Store.Sort;
    collection: string;
  }

  export interface DetailsUrlState {
    data: Store.Product;
    variants: ValueRefinement[];
  }

  export type Refinement = ValueRefinement | RangeRefinement;

  export interface ValueRefinement extends BaseRefinement {
    value: string;
  }

  export interface RangeRefinement extends BaseRefinement {
    low: number;
    high: number;
  }

  export interface BaseRefinement {
    field: string;
  }

  export interface Parser<T> {
    parse: (url: string) => T;
  }

  export interface Generator<T> {
    build: (request: T) => string;
  }

  export type Beautifier<T, R = T> = Parser<T> & Generator<R>;

  export interface Beautifiers {
    search: Beautifier<SearchUrlState>;
    navigation: Beautifier<Request, string>;
    details: Beautifier<DetailsUrlState>;
    [key: string]: Beautifier<any>;
  }
}

export default UrlBeautifier;
