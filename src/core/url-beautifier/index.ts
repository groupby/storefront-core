import { Store } from '@storefront/flux-capacitor';
import { Request, SelectedRefinement, SelectedValueRefinement } from 'groupby-api';
import * as URI from 'urijs';
import UrlService from '../../services/url';
import BeautifierFactory from './factory';

class UrlBeautifier {

  beautifiers: UrlBeautifier.Beautifiers = BeautifierFactory.create(this);

  constructor(public routes: UrlService.Routes, public config: UrlBeautifier.Configuration) {
    this.beautifiers = BeautifierFactory.create(this);

    const keys = [];
    for (let mapping of this.config.refinementMapping) {
      const key = Object.keys(mapping)[0];
      UrlBeautifier.validateToken(key, keys);
      keys.push(key);
    }
    UrlBeautifier.validateToken(this.config.queryToken, keys);
  }

  parse<T>(url: string): T {
    const uri = URI.parse(url);
    const activeRoute = Object.keys(this.routes).find((route) => uri.path.startsWith(this.routes[route]));

    if (activeRoute) {
      return this.beautifiers[activeRoute].parse(UrlBeautifier.extractAppRoute(uri, this.routes[activeRoute]));
    } else {
      throw new Error('invalid route');
    }
  }

  build(type: string, request: any) {
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

  static extractAppRoute({ query, path }: { query: string, path: string }, route: string) {
    return new URI({ path: path.substr(route.length), query }).toString();
  }
}

namespace UrlBeautifier {
  export interface Configuration {
    refinementMapping?: any[];
    params?: {
      page?: string;
      pageSize?: string;
      refinements?: string;
      sort?: string;
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

  export interface DetailsRequest {
    id: string;
    title: string;
    refinements: SelectedValueRefinement[];
  }

  export interface SearchRequest {
    query?: string;
    page: number;
    pageSize: number;
    refinements: SelectedRefinement[];
  }

  export interface Parser<T> {
    parse: (url: string) => T;
  }

  export interface Generator<T> {
    build: (request: T) => string;
  }

  export type Beautifier<T, R = T> = Parser<T> & Generator<R>;

  export interface Beautifiers {
    search: Beautifier<SearchRequest>;
    navigation: Beautifier<Request, string>;
    details: Beautifier<DetailsRequest>;
    [key: string]: Beautifier<any>;
  }
}

export default UrlBeautifier;
