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
    const pageSize = urlPageSize || Selectors.pageSize(store);
    const requestPageSize = Adapters.Request.clampPageSize(urlPage || 1, pageSize);
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
    const pageSize = urlPageSize || Selectors.pastPurchasePageSize(store);
    const requestPageSize = Adapters.Request.clampPageSize(urlPage || 1, pageSize);
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
  }

  // export const getSortIndex = (stateSort: Store.Sort[], requestSort: Store.Sort) => {
  //   return stateSort.findIndex((sort) => {
  //     if (requestSort && sort.field === requestSort.field) {
  //       return !!sort['descending'] === requestSort.descending;
  //     }
  //   });
  // };

  // export const getNavigations = (request: UrlBeautifier.SearchUrlState) => {
  //   return {
  //     allIds: getAllIds(request),
  //     byId: getById(request),
  //   };
  // };
  //
  // export const getAllIds = (request: UrlBeautifier.SearchUrlState) => {
  //   return request.refinements.reduce((fields, refinement) => {
  //     if (!fields.includes(refinement.field)) {
  //       fields.push(refinement.field);
  //     }
  //     return fields;
  //   }, []);
  // };
  //
  // export const getById = (request: UrlBeautifier.SearchUrlState) => {
  //   return request.refinements.reduce((navigations, refinement) => {
  //     const field = refinement.field;
  //     const transformed =
  //       'low' in refinement ? { low: refinement['low'], high: refinement['high'] } : { value: refinement['value'] };
  //     if (field in navigations) {
  //       const navigation = navigations[field];
  //       navigation.selected.push(navigation.refinements.push(transformed) - 1);
  //     } else {
  //       navigations[field] = <Store.Navigation>{
  //         field,
  //         label: field,
  //         range: 'low' in refinement,
  //         refinements: [transformed],
  //         selected: [0],
  //       };
  //     }
  //     return navigations;
  //   }, {});
  // };

  // export const mergePastPurchaseState = (state: Store.State, request: UrlBeautifier.SearchUrlState) => {
  //   const presentState = state.data.present;
  //   const { collection, refinements, pageSize, ...pastPurchaseData } = request;
  //   return {
  //     ...state,
  //     data: {
  //       ...state.data,
  //       present: {
  //         ...presentState,
  //         pastPurchases: {
  //           ...presentState.pastPurchases,
  //           ...pastPurchaseData,
  //           page: mergePastPurchasePageState(state, request),
  //           navigations: mergePastPurchaseNavigationsState(state, request),
  //           sort: {
  //             ...presentState.pastPurchases.sort,
  //             ...Selectors.pastPurchaseSort(state),
  //           },
  //         },
  //       },
  //     },
  //   };
  // };

  // export const mergePastPurchasePageState = (state: Store.State, request: UrlBeautifier.SearchUrlState) => {
  //   const presentState = state.data.present;
  //   const pageSizeIndex = Selectors.pastPurchasePageSizes(state).items.indexOf(request.pageSize);
  //   return {
  //     ...presentState.pastPurchases.page,
  //     current: request.page || Selectors.pastPurchasePage(state),
  //     sizes: {
  //       ...Selectors.pastPurchasePageSizes(state),
  //       selected: pageSizeIndex === -1 ? Selectors.pastPurchasePageSizeIndex(state) : pageSizeIndex,
  //     },
  //   };
  // };

  // export const mergePastPurchaseNavigationsState = (state: Store.State, request: UrlBeautifier.SearchUrlState) => {
  //   const presentState = state.data.present;
  //   const navigations = getNavigations(request);
  //   return {
  //     ...presentState.pastPurchases.navigations,
  //     allIds: navigations.allIds.length > 0 ? navigations.allIds : presentState.pastPurchases.navigations.allIds,
  //     byId: Object.keys(navigations.byId).length > 0 ? navigations.byId : presentState.pastPurchases.navigations.byId,
  //   };
  // };

  // export const mergeSearchState = (state: Store.State, request: UrlBeautifier.SearchUrlState) => {
  //   return {
  //     ...state,
  //     data: {
  //       ...state.data,
  //       present: {
  //         ...state.data.present,
  //         query: mergeSearchQueryState(state, request),
  //         page: mergeSearchPageState(state, request),
  //         collections: mergeSearchCollectionsState(state, request),
  //         sorts: mergeSearchSortsState(state, request),
  //         navigations: mergeSearchNavigationsState(state, request),
  //       },
  //     },
  //   };
  // };

  // export const mergeSearchQueryState = (state: Store.State, request: UrlBeautifier.SearchUrlState) => ({
  //   ...state.data.present.query,
  //   original: request.query || Selectors.query(state),
  // });
  //
  // export const mergeSearchPageState = (state: Store.State, request: UrlBeautifier.SearchUrlState) => {
  //   const pageSizeIndex = Selectors.pageSizes(state).items.indexOf(request.pageSize);
  //   return {
  //     ...state.data.present.page,
  //     current: request.page || Selectors.page(state),
  //     sizes: {
  //       ...Selectors.pageSizes(state),
  //       selected: pageSizeIndex === -1 ? Selectors.pageSizeIndex(state) : pageSizeIndex,
  //     },
  //   };
  // };
  //
  // export const mergeSearchCollectionsState = (state: Store.State, request: UrlBeautifier.SearchUrlState) => {
  //   return {
  //     ...Selectors.collections(state),
  //     selected: request.collection || Selectors.collection(state),
  //   };
  // };
  //
  // export const mergeSearchSortsState = (state: Store.State, request: UrlBeautifier.SearchUrlState) => {
  //   const currentSortIndex = getSortIndex(Selectors.sorts(state).items, request.sort);
  //   return {
  //     ...Selectors.sorts(state),
  //     selected: currentSortIndex === -1 ? Selectors.sortIndex(state) : currentSortIndex,
  //   };
  // };
  //
  // export const mergeSearchNavigationsState = (state: Store.State, request: UrlBeautifier.SearchUrlState) => {
  //   const presentState = state.data.present;
  //   const { allIds, byId } = getNavigations(request);
  //   return {
  //     ...presentState.navigations,
  //     allIds: allIds.length > 0 ? allIds : presentState.navigations.allIds,
  //     byId: Object.keys(byId).length > 0 ? byId : presentState.navigations.byId,
  //   };
  // };
}

export default UrlUtils;
