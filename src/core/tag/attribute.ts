import * as utils from '../utils';

interface Attribute {
  name: string;
  type?: 'boolean' | 'string' | 'number' | 'function' | 'object' | 'symbol' | 'undefined';
  default?: any;
}

namespace Attribute {
  export function implyType(attribute: Attribute): Attribute {
    if (!attribute.type && attribute.default != null) {
      return { ...attribute, type: typeof attribute.default };
    } else {
      return attribute;
    }
  }
}

export default Attribute;
