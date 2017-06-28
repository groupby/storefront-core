import { Events, Routes, Selectors, Store } from '@storefront/flux-capacitor';
import { core, BaseService } from '../core/service';
import UrlBeautifier from '../core/url-beautifier';
import { WINDOW } from '../core/utils';
import StoreFront from '../storefront';

export const STOREFRONT_APP_ID = 'GroupBy StoreFront';

@core
class UrlService extends BaseService<UrlService.Options> {

  beautifier: UrlBeautifier = new UrlBeautifier(this.opts.routes, this.opts.beautifier, this.app.config);
  urlState: UrlService.UrlStateFunctions = {
    search: UrlService.searchUrlState,
    details: UrlService.detailsUrlState,
    navigation: UrlService.navigationUrlState
  };

  constructor(app: StoreFront, opts: any) {
    super(app, opts);
    WINDOW().addEventListener('popstate', this.rewind);
  }

  init() {
    this.readInitialUrl();
  }

  readInitialUrl() {
    try {
      const { route, request } = this.beautifier.parse<UrlBeautifier.SearchUrlState>(WINDOW().location.href);

      if (route === Routes.SEARCH) {
        const newState = UrlService.mergeSearchState(this.app.flux.store.getState(), request);
        const unsubscribe = this.app.flux.store.subscribe(() => {
          unsubscribe();
          this.augmentHistory(route, request);
        });
        this.refreshState(newState);
      } else {
        this.augmentHistory(route, request);
      }

    } catch (e) {
      this.app.log.warn('unable to parse state from url', e);
      this.listenForHistoryChange();
    }
  }

  augmentHistory(route: string, request: any) {
    const location = WINDOW().location;
    const state = this.app.flux.store.getState();
    const url = location.pathname + location.search;

    WINDOW().history.replaceState({ url, state, app: STOREFRONT_APP_ID }, WINDOW().document.title, url);
    this.app.flux.once(Events.HISTORY_SAVE, this.listenForHistoryChange);
    switch (route) {
      case Routes.SEARCH:
        this.app.flux.store.dispatch(<any>this.app.flux.actions.fetchProducts());
        break;
      case Routes.DETAILS:
        this.app.flux.store.dispatch(<any>this.app.flux.actions.fetchProductDetails(request.id));
        break;
    }
  }

  listenForHistoryChange = () => {
    this.app.flux.on(Events.HISTORY_SAVE, this.updateHistory);
  }

  updateHistory = ({ state, route }: { state: Store.State, route: string }) => {
    const url = this.beautifier.build(route, this.urlState[route](state));
    WINDOW().history.pushState({ url, state, app: STOREFRONT_APP_ID }, '', url);
    this.app.flux.emit(Events.URL_UPDATED, url);
  }

  rewind = (event: PopStateEvent) => {
    const eventState = event.state;
    if (eventState && event.state.app === STOREFRONT_APP_ID) {
      this.refreshState(eventState.state);
    }
  }

  refreshState(state: any): Promise<any> {
    return <any>this.app.flux.store.dispatch(this.app.flux.actions.refreshState(state));
  }

  static searchUrlState(state: Store.State): UrlBeautifier.SearchUrlState {
    return {
      query: Selectors.query(state),
      page: state.data.page.current,
      pageSize: Selectors.pageSize(state),
      refinements: Selectors.selectedRefinements(state).map((refinement) => {
        if ('value' in refinement) {
          return { field: refinement.navigationName, value: refinement.value };
        } else {
          return { field: refinement.navigationName, low: refinement.low, high: refinement.high };
        }
      }),
      sort: Selectors.sort(state),
      collection: Selectors.collection(state),
    };
  }

  static detailsUrlState(state: Store.State): UrlBeautifier.DetailsUrlState {
    const details = Selectors.details(state);
    return {
      id: details.id,
      title: details.title,
      variants: []
    };
  }

  static navigationUrlState(state: Store.State): any {
    return {};
  }

  static mergeSearchState(state: Store.State, request: UrlBeautifier.SearchUrlState) {
    const dataState = state.data;
    const pageSizeIndex = dataState.page.sizes.items.indexOf(request.pageSize);
    const currentSortIndex = dataState.sorts.items.findIndex((sort) => {
      if (request.sort && sort.field === request.sort.field) {
        return !!sort['descending'] === request.sort.descending;
      }
    });
    const navigationsAllIds = request.refinements.reduce((fields, refinement) => {
      if (!fields.includes(refinement.field)) {
        fields.push(refinement.field);
      }
      return fields;
    }, []);
    const navigationsByIds = request.refinements.reduce((navigations, refinement) => {
      const field = refinement.field;
      const transformed = 'low' in refinement
        ? { low: refinement['low'], high: refinement['high'] }
        : { value: refinement['value'] };
      if (field in navigations) {
        const navigation = navigations[field];
        navigation.selected.push(navigation.refinements.push(transformed) - 1);
      } else {
        navigations[field] = <Store.Navigation>{
          field,
          label: field,
          range: 'low' in refinement,
          refinements: [transformed],
          selected: [0]
        };
      }

      return navigations;
    }, {});

    return {
      ...state,
      data: {
        ...dataState,
        query: {
          ...dataState.query,
          original: request.query || dataState.query.original
        },
        page: {
          ...dataState.page,
          current: request.page || dataState.page.current,
          sizes: {
            ...dataState.page.sizes,
            selected: pageSizeIndex === -1 ? dataState.page.sizes.selected : pageSizeIndex
          }
        },
        collections: {
          ...dataState.collections,
          selected: request.collection || dataState.collections.selected
        },
        sorts: {
          ...dataState.sorts,
          selected: currentSortIndex === -1 ? dataState.sorts.selected : currentSortIndex
        },
        navigations: {
          ...dataState.navigations,
          allIds: navigationsAllIds.length > 0 ? navigationsAllIds : dataState.navigations.allIds,
          byId: Object.keys(navigationsByIds).length > 0 ? navigationsByIds : dataState.navigations.byId
        }
      }
    };
  }
}

namespace UrlService {
  export interface Options {
    beautifier?: UrlBeautifier.Configuration;
    routes?: Routes;
  }

  export interface Routes {
    search: string;
    details: string;
    navigation: string;
  }

  export type UrlStateFunction = (state: any) => any;

  export interface UrlStateFunctions {
    search: UrlStateFunction;
    details: UrlStateFunction;
    navigation: UrlStateFunction;
  }
}

export default UrlService;
