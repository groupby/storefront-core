import { Adapters, Selectors, Store } from '@storefront/flux-capacitor';
import UrlBeautifier from '..';
import { UrlGenerator } from '../handler';
import * as utils from '../utils';

export default class SearchUrlGenerator extends UrlGenerator<UrlBeautifier.SearchUrlState> {

  build = (state: UrlBeautifier.SearchUrlState) => {
    const path = [];
    const query = {};
    const initialState: Store.State = <any>Adapters.Configuration.initialState(this.beautifier.appConfig);

    // layman's clone
    state = { ...state, refinements: [...state.refinements] };

    if (state.query) {
      path.push(utils.encodeChars(state.query));
    }

    if (this.config.useReferenceKeys) {
      path.push(...this.convertReferencedRefinements(state).map(utils.encodeChars));
    } else {
      path.push(...SearchUrlGenerator.convertPathRefinements(state.refinements).map(utils.encodeChars));
    }

    if (this.config.params.refinements && state.refinements.length !== 0) {
      query[this.config.params.refinements] = utils.encodeArray(SearchUrlGenerator.sortRefinements(
        state.refinements.map((refinement) =>
                              refinement['value'] ?
                              { ...refinement, value: utils.escapeSeparators(refinement['value']) } :
                              refinement)));
    }
    if ('pageSize' in state) {
      const initialSizes = Selectors.pageSizes(initialState);
      const initialPageSize = initialSizes.items[initialSizes.selected];
      const pageSize = state.pageSize;
      if (initialPageSize !== pageSize) {
        query[this.config.params.pageSize] = pageSize;
      }
    }
    if ('page' in state) {
      const page = state.page;
      if (initialState.data.present.page.first !== state.page) {
        query[this.config.params.page] = page;
      }
    }
    if (state.sort) {
      const initialSorts = Selectors.sorts(initialState);
      const initialSort = initialSorts.items[initialSorts.selected];
      const sort = state.sort;
      if (initialSort && (initialSort.field !== sort.field || initialSort.descending !== sort.descending)) {
        query[this.config.params.sort] = utils.encodeArray([SearchUrlGenerator.convertSort(sort)]);
      }
    }
    if (state.collection) {
      const initialCollection = Selectors.collection(initialState);
      const collection = state.collection;
      if (initialCollection !== collection) {
        query[this.config.params.collection] = utils.encodeChars(state.collection);
      }
    }

    return this.buildUrl(path, query);
  }

  buildUrl(path: string[], query: object) {
    let url = `/${path.join('/')}`;
    if (this.config.suffix) {
      url += `/${this.config.suffix.replace(/^\/+/, '')}`;
    }

    const queryPart = Object.keys(query)
      .sort()
      .map((key) => `${key}=${query[key]}`)
      .join('&');

    if (queryPart) {
      url += `?${queryPart}`;
    }

    return url;
  }

  convertReferencedRefinements(state: UrlBeautifier.SearchUrlState) {
    const path = [];
    const countMap = {};
    const { map, keys } = SearchUrlGenerator.generateRefinementMap(state.refinements, this.config.refinementMapping);

    // add refinements
    keys.forEach((key) => {
      const refinements = <UrlBeautifier.Refinement[]>map[key];
      countMap[key] = refinements.length;
      refinements.map(SearchUrlGenerator.convertToSelectedValueRefinement)
        .sort(SearchUrlGenerator.refinementsComparator)
        .forEach((selectedValueRefinement) => path.push(selectedValueRefinement.value));
    });

    // add reference key
    if (keys.length !== 0 || state.query) {
      let referenceKey = '';

      if (state.query) {
        referenceKey += this.config.queryToken;
      }
      keys.forEach((key) => referenceKey += key.repeat(countMap[key]));

      path.push(referenceKey);
    }

    return path;
  }

  static convertSort(sort: Store.Sort): [string, boolean[]] {
    const { field, descending = !!sort.descending } = sort;
    return [field, [descending]];
  }

  static convertPathRefinements(refinements: UrlBeautifier.Refinement[]) {
    const path = [];
    const valueRefinements = [];

    for (let i = refinements.length - 1; i >= 0; --i) {
      if ('value' in refinements[i]) {
        valueRefinements.push(...refinements.splice(i, 1));
      }
    }

    valueRefinements.sort(SearchUrlGenerator.refinementsComparator)
      .forEach((selectedValueRefinement) =>
        path.push(selectedValueRefinement.value, selectedValueRefinement.field));

    return path;
  }

  static sortRefinements(refinements: UrlBeautifier.Refinement[]) {
    return refinements.sort(SearchUrlGenerator.refinementsComparator)
      .reduce((refs, refinement, index) => {
        if ('value' in refinement) {
          // tslint:disable-next-line max-line-length
          refs.push([utils.encodeChars(refinement.field), [utils.encodeChars(refinement['value'])]]);
        } else {
          // tslint:disable-next-line max-line-length
          refs.push([utils.encodeChars(refinement.field), [refinement['low'], refinement['high']]]);
        }
        return refs;
      }, []);
  }

  static convertToSelectedValueRefinement(refinement: UrlBeautifier.Refinement): UrlBeautifier.ValueRefinement {
    if ('value' in refinement) {
      return <UrlBeautifier.ValueRefinement>refinement;
    } else {
      throw new Error('cannot map range refinements');
    }
  }

  static refinementsComparator(lhs: UrlBeautifier.Refinement, rhs: UrlBeautifier.Refinement) {
    let comparison = lhs.field.localeCompare(rhs.field);
    if (comparison === 0) {
      if ('value' in lhs) {
        comparison = lhs['value'].localeCompare(rhs['value']);
      } else {
        comparison = lhs['low'] - rhs['low'];
        if (comparison === 0) {
          comparison = lhs['high'] - rhs['high'];
        }
      }
    }
    return comparison;
  }

  static generateRefinementMap(refinements: UrlBeautifier.Refinement[], refinementMapping: any[]) {
    const refinementMap = {};
    const refinementKeys = [];
    for (let mapping of refinementMapping) {
      const key = Object.keys(mapping)[0];
      const matchingRefinements = refinements.filter(({ field }) => field === mapping[key]);
      if (matchingRefinements.length !== 0) {
        refinementKeys.push(key);
        refinementMap[key] = matchingRefinements;
        matchingRefinements.forEach((ref) => refinements.splice(refinements.indexOf(ref), 1));
      }
    }
    return { map: refinementMap, keys: refinementKeys };
  }
}
