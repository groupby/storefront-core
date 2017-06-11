import * as URI from 'urijs';
import UrlBeautifier from '..';
import { UrlParser } from '../handler';

export class DetailsUrlParser extends UrlParser<UrlBeautifier.DetailsRequest> {

  parse = (url: string) => {
    const uri = URI.parse(url);
    const path = uri.path.split('/')
      .filter((val) => val)
      .map((val) => decodeURIComponent(val).replace(/-/g, ' '));

    if (path.length < 2) {
      throw new Error('path has fewer than two parts');
    }

    const title = path.shift();
    const id = path.pop();
    let refinements = [];

    if (path.length !== 0) {
      if (!this.config.useReferenceKeys) {
        refinements = DetailsUrlParser.extractPathRefinements(path);
      } else {
        refinements = DetailsUrlParser.extractReferencesRefinements(path, this.keysToRefinements);
      }
    }

    return { id, refinements, title };
  }

  static extractReferencesRefinements(path: string[], keysToRefinements: { [key: string]: string }) {
    if (path.length < 2) {
      throw new Error('path has wrong number of parts');
    }

    const referenceKeys = path.pop().split('');

    if (path.length !== referenceKeys.length) {
      throw new Error('token reference is invalid');
    }

    return path.map((value) => ({
      value,
      navigationName: keysToRefinements[referenceKeys.shift()],
      type: 'Value'
    }));
  }

  static extractPathRefinements(path: string[]) {
    if (path.length % 2 !== 0) {
      throw new Error('path has an odd number of parts');
    }

    const refinements = [];
    while (path.length) {
      const value = path.shift();
      const navigationName = path.shift();
      refinements.push({ navigationName, value, type: 'Value' });
    }

    return refinements;
  }
}

export default DetailsUrlParser;
