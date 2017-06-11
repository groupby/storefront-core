import { Configuration } from '.';

const DEFAULTS: Partial<Configuration> = {
  collection: 'default',
  area: 'Production',

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
        params: {
          refinements: 'refinements',
          page: 'page',
          pageSize: 'page_size'
        },
        queryToken: 'q',
        suffix: '',
        useReferenceKeys: true,
        navigations: {}
      },
      routes: {
        search: '/search',
        details: '/details',
        navigation: '/navigation'
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
