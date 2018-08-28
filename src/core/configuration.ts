import { Configuration as FluxConfiguration } from '@storefront/flux-capacitor';
import { TagMixin } from 'riot';
import { ServiceConfiguration } from '../services';
import StoreFront from '../storefront';
import DEFAULTS from './defaults';
import { CustomMixins, GlobalMixin, Structure } from './types';
import * as utils from './utils';

interface Configuration extends FluxConfiguration {
  /**
   * A mapping of variable names to record fields.
   *
   * The property names are variable names that can be used in the markup to
   * display product/article data.
   *
   * The values correspond to record fields available in `allMeta`.
   *
   * Additional fields can be defined as neeeded.
   */
  structure?: Structure;

  /**
   * Default props for configurable Tags.
   *
   * The properties are keyed by tag names (without the `gb-` prefix, if any),
   * and its values are the props to configure for that tag.
   */
  tags?: { [key: string]: any };

  /**
   * Configuration for services.
   */
  services?: ServiceConfiguration;

  /**
   * An optional initial bootstrap function.
   * This function is run before serivces are initialized.
   *
   * @param app The StoreFront app instance.
   */
  bootstrap?: (app: StoreFront) => void;

  /**
   * Miscellaneous options.
   */
  options?: {
    /**
     * If `true`, apply the base StoreFront structural styling.
     */
    ui?: boolean;
    /**
     * If `true`, apply the default basic styling.
     */
    stylish?: boolean;
    /**
     * If `true`, use the legacy aliasing pattern instead of provide/consume.
     * You are encouraged to use the provide/consume pattern for new implementations.
     */
    legacyAliasing?: boolean;
    /**
     * If `true`, perform a search on any initial page load.
     * Search pages will perform a search regardless of the value of this option.
     */
    initialSearch?: boolean;
    /**
     * If `true`, apply the standard StoreFront Tag mixin.
     */
    globalMixin?: boolean;
    /**
     * The Riot instance to use instead of creating a new one.
     */
    riot?: any;
  };

  /**
   * Configuration for mixins, which are sets of reusable functions
   * and properties that can be shared across tags.
   */
  mixins?: {
    /**
     * The mixin to apply to all tags. This mixin is automatically applied
     * after all of the standard StoreFront mixins are applied, so it can be
     * used to override StoreFront functionality.
     *
     * The lifecycle function `init()` cannot be overriden by this global mixin.
     */
    global?: GlobalMixin;
    /**
     * Named mixins that are available on-demand to tags.
     *
     * To apply one of these mixins, add this to your tag's constructor:
     *
     * ```js
     * this.mixin('name_of_mixin');
     * ```
     */
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
