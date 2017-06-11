import { Request } from 'groupby-api';
import * as URI from 'urijs';
import UrlBeautifier from '..';
import { UrlParser } from '../handler';

export default class NavigationUrlParser extends UrlParser<Request> {

  parse = (url: string) => {
    const uri = URI.parse(url);
    const path = uri.path.split('/').filter((val) => val);

    if (path.length > 1) {
      throw new Error('path contains more than one part');
    }

    const name = decodeURIComponent(path[0]).replace(/-/g, ' ');
    if (!(name in this.config.navigations)) {
      throw new Error(`no navigation mapping found for ${name}`);
    }

    return this.config.navigations[name];
  }
}
