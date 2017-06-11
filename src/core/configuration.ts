import FluxCapacitor from '@storefront/flux-capacitor';
import { Request } from 'groupby-api';
import { ServiceConfiguration } from '../services';
import StoreFront from '../storefront';
import DEFAULTS from './defaults';
import { Structure } from './types';
import * as utils from './utils';

interface Configuration extends FluxCapacitor.Configuration {
  structure?: Structure;

  tags?: { [key: string]: any };

  services?: ServiceConfiguration;

  bootstrap?: (app: StoreFront) => void;

  options?: {
    stylish?: boolean;
    initialSearch?: boolean;
    simpleAttach?: boolean;
    globalMixin?: boolean;
    riot?: any;
  };
}

namespace Configuration {
  export namespace Transformer {

    /**
     * transform and validate raw configuration
     */
    export function transform(rawConfig: Configuration): Configuration {
      const config = Transformer.deprecationTransform(rawConfig);
      const finalConfig = Transformer.applyDefaults(config);

      Transformer.validate(finalConfig);

      return finalConfig;
    }

    /**
     * transform to handle graceful deprecation of configuration options
     */
    export function deprecationTransform(config: Configuration): Configuration {
      return config;
    }

    /**
     * apply default configuration options
     */
    export function applyDefaults(config: Configuration): Configuration {
      return utils.deepAssign({}, DEFAULTS, config);
    }

    /**
     * check final configuration for validity
     */
    export function validate(config: Configuration) { }
  }
}

export default Configuration;
