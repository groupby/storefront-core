import { Request } from 'groupby-api';
import { utils, Structure } from '.';
import { CoreServices } from '../services';
import StoreFront from '../storefront';
import DEFAULTS from './defaults';

namespace Configuration {
  export const Transformer = { // tslint:disable-line:variable-name
    transform(rawConfig: Configuration): Configuration {
      const config = Transformer.deprecationTransform(rawConfig);
      const finalConfig = Transformer.applyDefaults(config);

      Transformer.validate(finalConfig);

      return finalConfig;
    },

    /**
     * transform to handle graceful deprecation of configuration options
     */
    deprecationTransform(config: Configuration): Configuration {
      return config;
    },

    /**
     * Apply default configuration options
     */
    applyDefaults(config: Configuration): Configuration {
      return utils.deepAssign({}, DEFAULTS, config);
    },

    validate(config: Configuration) { }
  };
}

interface Configuration {
  customerId: string;
  structure: Structure;

  collection?: string;
  area?: string;
  language?: string;
  visitorId?: string;
  sessionId?: string;

  query?: Partial<Request>;

  tags?: { [key: string]: any };

  services?: CoreServices;

  bootstrap?: (app: StoreFront) => void;

  stylish?: boolean;
  initialSearch?: boolean;
  simpleAttach?: boolean;
  globalMixin?: boolean;
  riot?: any;
}

export default Configuration;
