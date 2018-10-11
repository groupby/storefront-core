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
   * The logging service adds logging output for debugging during lifecycle events.
   */
  logging?: Service.Options<logging.Options>;
  /**
   * Configuration for the search service.
   * The search service listens to store updates and triggers a search request.
   */
  search?: Service.Options<search.Options>;
  /**
   * Configuration for the details service.
   * The details service listens to store updates and triggers a details request.
   */
  details?: Service.Options<details.Options>;
  /**
   * Configuration for the past purchases service.
   * The pastPurchases service listens to store updates and triggers a past purchases request.
   */
  pastPurchases?: Service.Options<pastPurchases.Options>;
  /**
   * Configuration for the autocomplete service.
   * The autocomplete service listens to store updates, triggers autocomplete requests, and registers autocomplete tags.
   */
  autocomplete?: Service.Options<any>;
  /**
   * Configuration for the collections service.
   * The collections service listens to store updates and triggers a collections request.
   */
  collections?: Service.Options<any>;
  /**
   * Configuration for the URL service.
   * The url service builds and parses the url from the store, handles browser history, and dispatches requests.
   */
  url?: Service.Options<url.Options>;
  /**
   * Configuration for the tracker service.
   * The tracker service sends beacons to the recommendations endpoint tracking user behaviour.
   */
  tracker?: Service.Options<tracker.Options>;
  /**
   * Configuration for the recommendations service.
   * The recommendations service fetches recommendations on initialization.
   */
  recommendations?: Service.Options<recommendations.Options>;
  /**
   * Configuration for the redirect service.
   * The redirect service listens to redirect events and updates the URL to the redirect.
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
