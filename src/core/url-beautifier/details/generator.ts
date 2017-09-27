import UrlBeautifier from '..';
import { UrlGenerator } from '../handler';
import * as utils from '../utils';

export class DetailsUrlGenerator extends UrlGenerator<UrlBeautifier.DetailsUrlState> {

  build = (request: UrlBeautifier.DetailsUrlState) => {
    let path = [];

    if (request.variants.length !== 0) {
      if (this.config.useReferenceKeys) {
        // tslint:disable-next-line max-line-length
        path = DetailsUrlGenerator.convertRefinements(request.variants, DetailsUrlGenerator.toKeys(this.config.variantMapping));
      } else {
        request.variants.forEach(({ value, field }) => path.push(value, field));
      }
    }

    if (request.data.title) {
      path.unshift(request.data.title);
    }

    if (request.data.id) {
      path.push(request.data.id);
    }

    return `/${path.map((part) => utils.encodeChars(part)).join('/')}`;
  }

  static convertRefinements(variants: UrlBeautifier.ValueRefinement[], variantsToKeys: object) {
    let referenceKeys = '';

    return variants.sort(DetailsUrlGenerator.variantsComparator)
      .reduce((path, { field, value }) => {

        if (!(field in variantsToKeys)) {
          throw new Error(`no mapping found for navigation '${field}'`);
        }

        path.push(value);
        referenceKeys += variantsToKeys[field];

        return path;
      }, [])
      .concat(referenceKeys);
  }

  static variantsComparator(lhs: UrlBeautifier.ValueRefinement, rhs: UrlBeautifier.ValueRefinement): number {
    let comparison = lhs.field.localeCompare(rhs.field);
    if (comparison === 0) {
      comparison = lhs.value.localeCompare(rhs.value);
    }
    return comparison;
  }
}

export default DetailsUrlGenerator;
