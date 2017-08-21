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
    navigationCount: 5,
    suggestionCount: 5,
    products: {
      count: 4,
    },
    recommendations: {
      suggestionCount: 2,
      suggestionMode: 'popular',
      location: true,
    },
    navigations: {},
    defaults: {
      suggestions: {},
      products: {}
    },
    overrides: {
      suggestions: {},
      products: {}
    },
  },
  recommendations: {
    idField: 'productId',
    productCount: 4,
    // TODO: switch to 'popular' once endpoint response format is fixed
    mode: 'trending'
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
      redirects: {},
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
