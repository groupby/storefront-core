import { Configuration as FluxConfiguration } from '@storefront/flux-capacitor';
import { TagMixin } from 'riot';
import { ServiceConfiguration } from '../services';
import StoreFront from '../storefront';
import DEFAULTS from './defaults';
import { CustomMixins, GlobalMixin, Structure } from './types';
import * as utils from './utils';

interface Configuration extends FluxConfiguration {
  structure?: Structure;

  tags?: { [key: string]: any };

  services?: ServiceConfiguration;

  bootstrap?: (app: StoreFront) => void;

  options?: {
    ui?: boolean;
    stylish?: boolean;
    initialSearch?: boolean;
    simpleAttach?: boolean;
    globalMixin?: boolean;
    riot?: any;
  };

  mixins?: {
    global?: GlobalMixin;
    custom?: CustomMixins;
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
    export function validate(config: Configuration) {
      if (!(config.customerId && config.customerId.trim())) {
        throw new Error('must provide a customer ID');
      }
      if (!config.structure) {
        throw new Error('must provide a record structure');
      }

      const struct = { ...config.structure, ...(config.structure._variant || {}).structure };
      if (!(struct.id && struct.id.trim())) {
        throw new Error('structure.id must be the path to the id field');
      }
      if (!(struct.title && struct.title.trim())) {
        throw new Error('structure.title must be the path to the title field');
      }
      if (!(struct.price && struct.price.trim())) {
        throw new Error('structure.price must be the path to the price field');
      }
    }
  }
}

export default Configuration;
