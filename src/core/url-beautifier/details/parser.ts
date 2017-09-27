import * as URLparse from 'url-parse';
import UrlBeautifier from '..';
import { UrlParser } from '../handler';
import * as utils from '../utils';

export class DetailsUrlParser extends UrlParser<UrlBeautifier.DetailsUrlState> {

  parse = (url: string) => {
    const uri = URLparse(url, true);
    const path = uri.pathname.split('/')
      .filter((val) => val)
      .map((val) => utils.decodeChars(val));

    if (path.length < 2) {
      throw new Error('path has too few parts');
    }

    const title = path.shift();
    const id = path.pop();
    let variants = [];

    if (path.length !== 0) {
      if (!this.config.useReferenceKeys) {
        variants = DetailsUrlParser.extractPathRefinements(path);
      } else {
        // tslint:disable-next-line max-line-length
        variants = DetailsUrlParser.extractReferencesRefinements(path, DetailsUrlParser.toObject(this.config.variantMapping));
      }
    }

    return { variants, data: { id, title } };
  }

  static extractReferencesRefinements(path: string[], keysToVariants: { [key: string]: string }) {
    if (path.length < 2) {
      throw new Error('path has too few parts');
    }

    const referenceKeys = path.pop().split('');

    if (path.length !== referenceKeys.length) {
      throw new Error('token reference is invalid');
    }

    return path.map((value) => ({
      value,
      field: keysToVariants[referenceKeys.shift()]
    }));
  }

  static extractPathRefinements(path: string[]) {
    if (path.length % 2 !== 0) {
      throw new Error('path has an odd number of parts');
    }

    const variants = [];
    while (path.length) {
      const value = path.shift();
      const field = path.shift();
      variants.push({ field, value });
    }

    return variants;
  }
}

export default DetailsUrlParser;
