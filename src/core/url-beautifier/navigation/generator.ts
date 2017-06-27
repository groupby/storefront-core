import { Request } from 'groupby-api';
import UrlBeautifier from '..';
import { UrlGenerator } from '../handler';
import * as utils from '../utils';

export default class NavigationUrlGenerator extends UrlGenerator<string> {

  build = (name: string) => {

    if (!(name in this.config.navigations)) {
      throw new Error(`no navigation mapping found for ${name}`);
    }

    return `/${utils.encodeChars(name)}`;
  }
}
