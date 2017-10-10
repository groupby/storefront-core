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
    redirectSingleResult: false,
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
    location: {
      distance: '10km',
      minSize: 10,
    },
    iNav: {
      navigations: {
        sort: false,
      },
      refinements: {
        sort: false,
      },
      size: 10,
      window: 'day',
    },
    productSuggestions: {
      idField: 'productId',
      productCount: 0,
      mode: 'trending'
    },
    pastPurchases: {
      productCount: 0
    }
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
