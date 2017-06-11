import { SelectedValueRefinement } from 'groupby-api';
import UrlBeautifier from '..';
import { UrlGenerator } from '../handler';

export class DetailsUrlGenerator extends UrlGenerator<UrlBeautifier.DetailsRequest> {

  build = (request: UrlBeautifier.DetailsRequest) => {
    let path = [];

    if (request.refinements.length !== 0) {
      if (this.config.useReferenceKeys) {
        path = DetailsUrlGenerator.convertRefinements(request.refinements, this.refinementsToKeys);
      } else {
        request.refinements.forEach(({ value, navigationName }) => path.push(value, navigationName));
      }
    }

    path.unshift(request.title);
    path.push(request.id);

    return `/${path.map((part) => encodeURIComponent(part.replace(/\s/g, '-'))).join('/')}`;
  }

  static convertRefinements(refinements: SelectedValueRefinement[], refinementsToKeys: object) {
    let referenceKeys = '';

    return refinements.sort(DetailsUrlGenerator.refinementsComparator)
      .reduce((path, { navigationName, value }) => {

        if (!(navigationName in refinementsToKeys)) {
          throw new Error(`no mapping found for navigation '${navigationName}'`);
        }

        path.push(value);
        referenceKeys += refinementsToKeys[navigationName];

        return path;
      }, [])
      .concat(referenceKeys);
  }

  static refinementsComparator(lhs: SelectedValueRefinement, rhs: SelectedValueRefinement): number {
    let comparison = lhs.navigationName.localeCompare(rhs.navigationName);
    if (comparison === 0) {
      comparison = lhs.value.localeCompare(rhs.value);
    }
    return comparison;
  }
}

export default DetailsUrlGenerator;
