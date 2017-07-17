import { DEFAULT_AREA, DEFAULT_COLLECTION, Routes } from '@storefront/flux-capacitor';
import Configuration from './configuration';

const DEFAULTS: Partial<Configuration> = {
  collection: DEFAULT_COLLECTION,
  area: DEFAULT_AREA,

  structure: {
    id: 'id',
    title: 'title',
    price: 'price'
  },

  tags: {},

  search: {
    defaults: {},
    overrides: {},
  },
  autocomplete: {
    defaults: {
      suggestions: {},
      products: {}
    },
    overrides: {
      suggestions: {},
      products: {}
    },
  },
  network: {},

  services: {
    logging: {
      level: 'debug'
    },
    url: {
      beautifier: {
        refinementMapping: [],
        variantMapping: [],
        params: {
          refinements: 'refinements',
          page: 'page',
          pageSize: 'page_size',
          sort: 'sort',
          collection: 'collection'
        },
        queryToken: 'q',
        suffix: '',
        useReferenceKeys: true,
        navigations: {}
      },
      routes: {
        [Routes.SEARCH]: `/${Routes.SEARCH}`,
        [Routes.DETAILS]: `/${Routes.DETAILS}`,
        [Routes.NAVIGATION]: `/${Routes.NAVIGATION}`
      }
    },
    tracker: {
      warnings: true
    }
  },

  options: {
    ui: true,
    stylish: false,
    initialSearch: false,
    simpleAttach: true,
    globalMixin: true
  }
};

export default DEFAULTS;
