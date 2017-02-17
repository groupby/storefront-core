import { Configuration } from '.';

const DEFAULTS: Partial<Configuration> = {
  collection: 'default',
  area: 'Production',

  services: {
    logging: {
      level: 'debug'
    }
  },

  stylish: false,
  initialSearch: false,
  simpleAttach: true,
  globalMixin: true
};

export default DEFAULTS;
