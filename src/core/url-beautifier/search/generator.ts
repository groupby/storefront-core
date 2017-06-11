import { Store } from '@storefront/flux-capacitor';
import { Request, SelectedRangeRefinement, SelectedRefinement, SelectedValueRefinement } from 'groupby-api';
import UrlBeautifier from '..';
import { UrlGenerator } from '../handler';

export default class SearchUrlGenerator extends UrlGenerator<UrlBeautifier.SearchRequest> {

  build = (request: UrlBeautifier.SearchRequest) => {
    const path = [];
    const query = {};

    // layman's clone
    request = { ...request, refinements: [...request.refinements] };

    if (request.query) {
      path.push(request.query);
    }

    if (this.config.useReferenceKeys) {
      path.push(...this.convertReferencedRefinements(request));
    } else {
      path.push(...SearchUrlGenerator.convertPathRefinements(request));
    }

    if (request.refinements.length !== 0) {
      query[this.config.params.refinements] = SearchUrlGenerator.convertTrailingRefinements(request);
    }

    if ('pageSize' in request) {
      query[this.config.params.pageSize] = request.pageSize;
    }
    if ('page' in request) {
      query[this.config.params.page] = request.page;
    }

    return this.buildUrl(path, query);
  }

  convertReferencedRefinements(request: UrlBeautifier.SearchRequest) {
    const path = [];
    const countMap = {};
    const { map, keys } = SearchUrlGenerator.generateRefinementMap(request.refinements, this.config.refinementMapping);

    // add refinements
    keys.forEach((key) => {
      const refinements = <SelectedRefinement[]>map[key];
      countMap[key] = refinements.length;
      refinements.map(SearchUrlGenerator.convertToSelectedValueRefinement)
        .sort(SearchUrlGenerator.refinementsComparator)
        .forEach((selectedValueRefinement) => path.push(selectedValueRefinement.value));
    });

    // add reference key
    if (keys.length !== 0 || request.query) {
      let referenceKey = '';

      if (request.query) {
        referenceKey += this.config.queryToken;
      }
      keys.forEach((key) => referenceKey += key.repeat(countMap[key]));

      path.push(referenceKey);
    }

    return path;
  }

  buildUrl(path: string[], query: object) {
    let url = `/${path.map((part) => encodeURIComponent(part)).join('/')}`;

    if (this.config.suffix) {
      url += `/${this.config.suffix.replace(/^\/+/, '')}`;
    }

    const queryPart = Object.keys(query)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(query[key])}`)
      .join('&');

    if (queryPart) {
      url += '?' + queryPart;
    }

    return url.replace(/\s|%20/g, '-');
  }

  static convertPathRefinements({ refinements }: UrlBeautifier.SearchRequest) {
    const path = [];
    const valueRefinements = [];

    for (let i = refinements.length - 1; i >= 0; --i) {
      if (refinements[i].type === 'Value') {
        valueRefinements.push(...refinements.splice(i, 1));
      }
    }

    valueRefinements.map(SearchUrlGenerator.convertToSelectedValueRefinement)
      .sort(SearchUrlGenerator.refinementsComparator)
      .forEach((selectedValueRefinement) =>
        path.push(selectedValueRefinement.value, selectedValueRefinement.navigationName));

    return path;
  }

  static convertTrailingRefinements({ refinements }: UrlBeautifier.SearchRequest) {
    return refinements.sort((lhs, rhs) => lhs.navigationName.localeCompare(rhs.navigationName))
      .map(SearchUrlGenerator.stringifyRefinement)
      .join('~');
  }

  static convertToSelectedValueRefinement(refinement: SelectedRefinement): SelectedValueRefinement {
    if (refinement.type === 'Value') {
      return <SelectedValueRefinement>refinement;
    } else {
      throw new Error('cannot map range refinements');
    }
  }

  static refinementsComparator(lhs: SelectedValueRefinement, rhs: SelectedValueRefinement) {
    let comparison = lhs.navigationName.localeCompare(rhs.navigationName);
    if (comparison === 0) {
      comparison = lhs.value.localeCompare(rhs.value);
    }
    return comparison;
  }

  static stringifyRefinement(refinement: SelectedRefinement): string {
    const name = refinement.navigationName;
    if (refinement.type === 'Value') {
      return `${name}:${(<SelectedValueRefinement>refinement).value}`;
    } else {
      return `${name}:${(<SelectedRangeRefinement>refinement).low}..${(<SelectedRangeRefinement>refinement).high}`;
    }
  }

  static generateRefinementMap(refinements: SelectedRefinement[], refinementMapping: any[]) {
    const refinementMap = {};
    const refinementKeys = [];
    for (let mapping of refinementMapping) {
      const key = Object.keys(mapping)[0];
      const matchingRefinements = refinements.filter((refinement) => refinement.navigationName === mapping[key]);
      if (matchingRefinements.length !== 0) {
        refinementKeys.push(key);
        refinementMap[key] = matchingRefinements;
        matchingRefinements.forEach((ref) => refinements.splice(refinements.indexOf(ref), 1));
      }
    }
    return { map: refinementMap, keys: refinementKeys };
  }
}
