import Service from '../core/service';
import StoreFront from '../storefront';
import autocomplete from './autocomplete';
import collections from './collections';
import details from './details';
import logging from './logging';
import search from './search';
import url from './url';

const SERVICES: Service.Constructor.Map = {
  logging,
  search,
  url,
  autocomplete,
  collections,
  details,
};

export default SERVICES;

export interface ServiceConfiguration {
  [key: string]: Service.Options<any>;
  logging?: Service.Options<logging.Options>;
  search?: Service.Options<search.Options>;
  autocomplete?: Service.Options<any>;
  collections?: Service.Options<any>;
  details?: Service.Options<any>;
  url?: Service.Options<any>;
}

export interface CoreServices {
  logging: logging;
  search: search;
  autocomplete: autocomplete;
  collections: collections;
  details: details;
  url: url;
}

export type SystemServices = CoreServices & Service.Map;
