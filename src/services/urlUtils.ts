import { Actions, Adapters, Events, Routes, Selectors, Store } from '@storefront/flux-capacitor';
import { Request } from 'groupby-api';
import * as UrlParse from 'url-parse';
import CoreSelectors from '../core/selectors';
import UrlBeautifier from '../core/url-beautifier';
import { WINDOW } from '../core/utils';

namespace UrlUtils {
  export const getBasePath = (): string => {
    const basePath = UrlParse(WINDOW().document.baseURI).pathname;

    return basePath === WINDOW().location.pathname ? '' : basePath.replace(/\/+$/, '');
  };

  export const searchUrlState = (state: Store.State): UrlBeautifier.SearchUrlState => {
    return {
      query: Selectors.query(state),
      page: Selectors.page(state),
      pageSize: Selectors.pageSize(state),
      refinements: Selectors.selectedRefinements(state).map((refinement) => {
        if (refinement.type === 'Value') {
          return { field: refinement.navigationName, value: refinement.value };
        } else {
          return { field: refinement.navigationName, low: refinement.low, high: refinement.high };
        }
      }),
      sort: Selectors.sort(state),
      collection: Selectors.collection(state),
    };
  };

  export const detailsUrlState = (state: Store.State): UrlBeautifier.DetailsUrlState => {
    const details: Store.Product = <any>CoreSelectors.transformedDetailsProduct(state);
    return {
      data: details.data,
      variants: [],
    };
  };

  export const navigationUrlState = (state: Store.State): any => {
    return {};
  };

  export const pastPurchaseUrlState = (state: Store.State): UrlBeautifier.SearchUrlState => {
    const sorts = Selectors.pastPurchaseSort(state);
    const selected = sorts.selected;

    return {
      query: Selectors.pastPurchaseQuery(state),
      page: Selectors.pastPurchasePage(state),
      pageSize: Selectors.pastPurchasePageSize(state),
      sort: sorts.items[selected],
      refinements: Selectors.pastPurchaseSelectedRefinements(state).map((nav) => {
        if (nav.type === 'Value') {
          return { field: nav.navigationName, value: nav.value };
        }
      }),
      collection: null,
    };
  };

  export const searchStateToRequest = (state: UrlBeautifier.SearchUrlState, store: Store.State): Partial<Request> => {
    const {
      collection = Selectors.collection(store),
      page = 1,
      pageSize: urlPageSize = Selectors.pageSize(store),
      query = Selectors.currentQuery(store),
      refinements: urlRefinements = [],
      sort: urlSort = Selectors.sort(store),
    } = state;
    let request: Partial<Request> = {};
    const pageSize = Adapters.Request.clampPageSize(page, urlPageSize);
    const skip = Adapters.Request.extractSkip(page, pageSize);
    const refinements = <any>urlRefinements.map((refinement) =>
      Adapters.Request.extractRefinement(refinement.field, <any>refinement)
    );
    const sort = <any>Adapters.Request.extractSort(urlSort);

    return {
      pageSize,
      skip,
      collection,
      query,
      refinements,
      sort,
    };
  };

  // tslint:disable-next-line max-line-length
  export const pastPurchaseStateToRequest = (state: UrlBeautifier.SearchUrlState, store: Store.State): Partial<Request> => {
    const {
      collection = Selectors.collection(store),
      page = 1,
      pageSize: urlPageSize = Selectors.pastPurchasePageSize(store),
      query = Selectors.pastPurchaseQuery(store),
      refinements: urlRefinements = [],
      sort: urlSort = Selectors.sort(store),
    } = state;
    let request: Partial<Request> = {};
    const pageSize = Adapters.Request.clampPageSize(page, urlPageSize);
    const skip = Adapters.Request.extractSkip(page, pageSize);
    const refinements = <any>urlRefinements.map((refinement) =>
      Adapters.Request.extractRefinement(refinement.field, <any>refinement)
    );
    const sort = <any>Adapters.Request.extractSort(urlSort);

    return {
      pageSize,
      skip,
      collection,
      query,
      refinements,
      sort,
    };
  };
}

export default UrlUtils;
