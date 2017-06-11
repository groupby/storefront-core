import { Request } from 'groupby-api';
import UrlBeautifier from '..';
import { UrlGenerator } from '../handler';

export default class NavigationUrlGenerator extends UrlGenerator<string> {

  build = (name: string) => {

    if (!(name in this.config.navigations)) {
      throw new Error(`no navigation mapping found for ${name}`);
    }

    return `/${encodeURIComponent(name.replace(/\s/g, '-'))}`;
  }
}
