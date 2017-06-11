import * as utils from './core/utils';

export const CORE = Symbol.for('storfront_core_service');
export const RIOT = Symbol.for('storefront_riot_instance');
export const TAGS = Symbol.for('storefront_tags');

const GLOBALS = (typeof global === 'undefined' ? window : global) || {};

namespace Globals {
  export function set(key: string | symbol, value: any) {
    if (key) {
      return GLOBALS[key] = value;
    }
  }

  export function get(key: string | symbol, defaultValue?: any) {
    return key in GLOBALS ? GLOBALS[key] : defaultValue;
  }

  export function getTags() {
    return Globals.set(TAGS, Globals.get(TAGS, []));
  }

  export function getRiot() {
    return Globals.set(RIOT, Globals.get(RIOT, utils.riot));
  }
}

export default Globals;
