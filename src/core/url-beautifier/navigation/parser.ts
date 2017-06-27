import { Request } from 'groupby-api';
import * as URLparse from 'url-parse';
import UrlBeautifier from '..';
import { UrlParser } from '../handler';
import * as utils from '../utils';

export default class NavigationUrlParser extends UrlParser<Request> {

  parse = (url: string) => {
    const uri = URLparse(url);
    const path = uri.pathname.split('/').filter((val) => val);

    if (path.length > 1) {
      throw new Error('path contains more than one part');
    }

    const name = utils.decodeChars(path[0]);
    if (!(name in this.config.navigations)) {
      throw new Error(`no navigation mapping found for ${name}`);
    }

    return this.config.navigations[name];
  }
}
