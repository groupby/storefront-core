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
      collection: urlCollection,
      page: urlPage,
      pageSize: urlPageSize,
      query: urlQuery,
      refinements: urlRefinements,
      sort: urlSort,
    } = state;
    let request: Partial<Request> = {};
    const size = urlPageSize || Selectors.pageSize(store);
    const pageSize = Adapters.Request.clampPageSize(urlPage || 1, size);
    const skip = Adapters.Request.extractSkip(urlPage || 1, pageSize);
    const collection = urlCollection || Selectors.collection(store);
    const query = urlQuery || Selectors.currentQuery(store);
    const refinements = <any>urlRefinements.map((refinement) =>
      Adapters.Request.extractRefinement(refinement.field, <any>refinement)
    );
    const sort = <any>Adapters.Request.extractSort(urlSort || Selectors.sort(store));

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
      collection: urlCollection,
      page: urlPage,
      pageSize: urlPageSize,
      query: urlQuery,
      refinements: urlRefinements,
      sort: urlSort,
    } = state;
    let request: Partial<Request> = {};
    const size = urlPageSize || Selectors.pastPurchasePageSize(store);
    const pageSize = Adapters.Request.clampPageSize(urlPage || 1, size);
    const skip = Adapters.Request.extractSkip(urlPage || 1, pageSize);
    const collection = urlCollection || Selectors.collection(store);
    const query = urlQuery || Selectors.pastPurchaseQuery(store);
    const refinements = <any>urlRefinements.map((refinement) =>
      Adapters.Request.extractRefinement(refinement.field, <any>refinement)
    );
    const sort = <any>Adapters.Request.extractSort(urlSort || Selectors.sort(store));

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
