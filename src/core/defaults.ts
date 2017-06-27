import { DEFAULT_AREA, DEFAULT_COLLECTION, Routes } from '@storefront/flux-capacitor';
import { Configuration } from '.';

const DEFAULTS: Partial<Configuration> = {
  collection: DEFAULT_COLLECTION,
  area: DEFAULT_AREA,

  structure: {
    id: 'id',
    title: 'title',
    price: 'price'
  },

  tags: {},

  search: {},
  autocomplete: {},
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
    }
  },

  options: {
    stylish: false,
    initialSearch: false,
    simpleAttach: true,
    globalMixin: true
  }
};

export default DEFAULTS;
