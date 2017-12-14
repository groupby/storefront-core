import Service from '../core/service';
import StoreFront from '../storefront';
import autocomplete from './autocomplete';
import cart from './cart';
import collections from './collections';
import logging from './logging';
import pastPurchases from './pastPurchases';
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
  cart,
  collections,
  tracker,
  recommendations,
  redirect,
  pastPurchases,
};

export default SERVICES;

export interface ServiceConfiguration {
  [key: string]: Service.Options<any>;
  logging?: Service.Options<logging.Options>;
  search?: Service.Options<search.Options>;
  pastPurchases?: Service.Options<pastPurchases.Options>;
  autocomplete?: Service.Options<any>;
  cart?: Service.Options<any>;
  collections?: Service.Options<any>;
  url?: Service.Options<any>;
  tracker?: Service.Options<tracker.Options>;
  recommendations?: Service.Options<any>;
  redirect?: Service.Options<any>;
}

export interface CoreServices {
  logging: logging;
  search: search;
  pastPurchases: pastPurchases;
  autocomplete: autocomplete;
  cart: cart;
  collections: collections;
  url: url;
  tracker: tracker;
  recommendations: recommendations;
  redirect: redirect;
}

export type SystemServices = CoreServices & Service.Map;
