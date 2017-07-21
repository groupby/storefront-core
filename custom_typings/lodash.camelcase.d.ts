declare module 'lodash.camelcase' {
  import { camelCase } from 'lodash';

  const lodashCamelCase: typeof camelCase;
  export = lodashCamelCase;
}
