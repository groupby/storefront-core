import { DEFAULT_AREA, DEFAULT_COLLECTION, Routes } from '@storefront/flux-capacitor';
import Configuration from './configuration';

const DEFAULTS: Partial<Configuration> = {
  collection: DEFAULT_COLLECTION,
  area: DEFAULT_AREA,

  structure: {
    id: 'id',
    title: 'title',
    price: 'price',
  },

  tags: {},

  search: {
    redirectSingleResult: false,
    overrides: {},
    useDefaultCollection: false,
  },
  personalization: {
    realTimeBiasing: {
      strength: 'Medium_Increase',
      maxBiases: 25,
      attributeMaxBiases: 3,
      expiry: 14,
      autocomplete: true,
    },
  },
  autocomplete: {
    searchCharMinLimit: 1,
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
    overrides: {
      suggestions: {},
      products: {},
    },
    hoverAutoFill: true,
    showCategoryValuesForFirstMatch: false,
  },
  recommendations: {
    location: false,
    idField: 'productId',
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
      productCount: 0,
      mode: 'trending',
    },
    pastPurchases: {
      enabled: false,
      productCount: 0,
      biasCount: 0,
      biasStrength: 'Medium_Increase',
      biasInfluence: 5,
      securedPayload: null,
    },
  },
  details: {
    overrides: {},
  },
  collections: {
    overrides: {},
  },
  refinements: {
    overrides: {},
  },
  network: {
    https: typeof window !== 'undefined' && window.location.protocol === 'https:',
  },

  history: {
    length: 1,
  },

  services: {
    autocomplete: {
      useFirstResult: false,
    },
    logging: {
      level: 'debug',
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
          collection: 'collection',
        },
        queryToken: 'q',
        suffix: '',
        useReferenceKeys: true,
        navigations: {},
      },
      redirects: {},
      routes: {
        search: `/${Routes.SEARCH}`,
        details: `/${Routes.DETAILS}`,
        navigation: `/${Routes.NAVIGATION}`,
        pastpurchase: `/${Routes.PAST_PURCHASE}`,
      },
    },
    tracker: {
      warnings: true,
    },
  },

  options: {
    ui: true,
    stylish: false,
    legacyAliasing: false,
    initialSearch: false,
    globalMixin: true,
  },

  mixins: {
    global: {
      shouldUpdate: false,
    },
    custom: {},
  },
};

export default DEFAULTS;
