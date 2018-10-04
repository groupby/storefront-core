import Service from '../core/service';
import StoreFront from '../storefront';
import autocomplete from './autocomplete';
import collections from './collections';
import details from './details';
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
  details,
  url,
  autocomplete,
  collections,
  tracker,
  recommendations,
  redirect,
  pastPurchases,
};

export default SERVICES;

export interface ServiceConfiguration {
  [key: string]: Service.Options<any>;
  /**
   * Configuration for the logging service.
   */
  logging?: Service.Options<logging.Options>;
  /**
   * Configuration for the search service.
   */
  search?: Service.Options<search.Options>;
  /**
   * Configuration for the details service.
   * The details service listens to store updates and triggers a details request.
   */
  details?: Service.Options<details.Options>;
  /**
   * Configuration for the past purchases service.
   */
  pastPurchases?: Service.Options<pastPurchases.Options>;
  /**
   * Configuration for the autocomplete service.
   */
  autocomplete?: Service.Options<any>;
  /**
   * Configuration for the collections service.
   */
  collections?: Service.Options<any>;
  /**
   * Configuration for the URL service.
   */
  url?: Service.Options<url.Options>;
  /**
   * Configuration for the tracker service.
   */
  tracker?: Service.Options<tracker.Options>;
  /**
   * Configuration for the recommendations service.
   */
  recommendations?: Service.Options<recommendations.Options>;
  /**
   * Configuration for the redirect service.
   */
  redirect?: Service.Options<redirect.Options>;
}

export interface CoreServices {
  logging: logging;
  search: search;
  details: details;
  pastPurchases: pastPurchases;
  autocomplete: autocomplete;
  collections: collections;
  url: url;
  tracker: tracker;
  recommendations: recommendations;
  redirect: redirect;
}

export type SystemServices = CoreServices & Service.Map;
