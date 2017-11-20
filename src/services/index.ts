import Service from '../core/service';
import StoreFront from '../storefront';
import autocomplete from './autocomplete';
import collections from './collections';
import logging from './logging';
import recommendations from './recommendations';
import redirect from './redirect';
import search from './search';
import tracker from './tracker';
import url from './url';

const SERVICES: Service.Constructor.Map = {
  logging,
  search,
  url,
  autocomplete,
  collections,
  tracker,
  recommendations,
  redirect,
};

export default SERVICES;

export interface ServiceConfiguration {
  [key: string]: Service.Options<any>;
  logging?: Service.Options<logging.Options>;
  search?: Service.Options<search.Options>;
  autocomplete?: Service.Options<any>;
  collections?: Service.Options<any>;
  url?: Service.Options<any>;
  tracker?: Service.Options<tracker.Options>;
  recommendations?: Service.Options<any>;
  redirect?: Service.Options<any>;
}

export interface CoreServices {
  logging: logging;
  search: search;
  autocomplete: autocomplete;
  collections: collections;
  url: url;
  tracker: tracker;
  recommendations: recommendations;
  redirect: redirect;
}

export type SystemServices = CoreServices & Service.Map;
