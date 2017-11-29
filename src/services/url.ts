import { Actions, Events, Routes, Selectors, Store } from '@storefront/flux-capacitor';
import * as UrlParse from 'url-parse';
import { core, BaseService } from '../core/service';
import UrlBeautifier from '../core/url-beautifier';
import { WINDOW } from '../core/utils';
import StoreFront from '../storefront';

export const STOREFRONT_APP_ID = 'GroupBy StoreFront';

@core
class UrlService extends BaseService<UrlService.Options> {

  beautifier: UrlBeautifier.SimpleBeautifier;
  urlState: UrlService.UrlStateFunctions = {
    search: UrlService.searchUrlState,
    details: UrlService.detailsUrlState,
    navigation: UrlService.navigationUrlState
  };

  constructor(app: StoreFront, opts: any) {
    super(app, opts);
    if (typeof this.opts.beautifier === 'function') {
      this.beautifier = this.opts.beautifier(this.app, this.generateRoutes());
    } else {
      this.beautifier = new UrlBeautifier(this.generateRoutes(), this.opts.beautifier, this.app.config);
    }
    WINDOW().addEventListener('popstate', this.rewind);
  }

  init() {
    this.readInitialUrl();
  }

  generateRoutes() {
    const basePath = UrlService.getBasePath();
    const routes = this.opts.routes;

    return Object.keys(routes)
      .reduce((generatedRoutes: any, prop) =>
        Object.assign(generatedRoutes, { [prop]: basePath + routes[prop] }), {});
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
    const { pathname, search } = WINDOW().location;
    const url = pathname + search;

    this.replaceHistory(url);
    this.app.flux.once(Events.HISTORY_SAVE, () => {
      this.replaceHistory(url);
      this.listenForHistoryChange();
    });
    switch (route) {
      case Routes.SEARCH:
        this.app.flux.store.dispatch(this.app.flux.actions.fetchProductsWhenHydrated());
        break;
      case Routes.DETAILS:
        this.app.flux.store.dispatch(this.app.flux.actions.fetchProductDetails(request.id));
        break;
    }
  }

  listenForHistoryChange = () => {
    this.app.flux.on(Events.HISTORY_SAVE, this.updateHistory);
  }

  updateHistory = ({ state, route }: { state: Store.State, route: string }) => {
    const url = this.beautifier.build(route, this.urlState[route](state));

    if (typeof this.opts.urlHandler === 'function') {
      this.opts.urlHandler(url);
    } else if (this.opts.redirects[url]) {
      WINDOW().location.assign(this.opts.redirects[url]);
    } else {
      WINDOW().history.pushState({ url, state: this.filterState(state), app: STOREFRONT_APP_ID }, '', url);
      this.app.flux.emit(Events.URL_UPDATED, url);
    }
  }

  replaceHistory(url: string) {
    WINDOW().history.replaceState({
      url,
      state: this.filterState(this.app.flux.store.getState()),
      app: STOREFRONT_APP_ID
    }, WINDOW().document.title, url);
  }

  filterState(state: Store.State) {
    const { session: { config, ...session }, ...rootConfig } = state;
    return { ...rootConfig, session };
  }

  rewind = (event: PopStateEvent) => {
    const eventState = event.state;
    if (eventState && event.state.app === STOREFRONT_APP_ID) {
      this.refreshState(eventState.state);
      this.app.flux.emit(Events.URL_UPDATED, WINDOW().location.href);
    }
  }

  refreshState(state: any): Promise<any> {
    return <any>this.app.flux.store.dispatch(this.app.flux.actions.refreshState(state));
  }

  static getBasePath(): string {
    const basePath = UrlParse(WINDOW().document.baseURI).pathname;

    return basePath === WINDOW().location.pathname ? '' : basePath.replace(/\/+$/, '');
  }

  static searchUrlState(state: Store.State): UrlBeautifier.SearchUrlState {
    return {
      query: Selectors.query(state),
      page: Selectors.page(state),
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
      data: details.data,
      variants: []
    };
  }

  static navigationUrlState(state: Store.State): any {
    return {};
  }

  static mergeSearchState(state: Store.State, request: UrlBeautifier.SearchUrlState) {
    const presentState = state.data.present;
    const pageSizeIndex = Selectors.pageSizes(state).items.indexOf(request.pageSize);
    const currentSortIndex = Selectors.sorts(state).items.findIndex((sort) => {
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
        ...state.data,
        present: {
          ...presentState,
          query: {
            ...presentState.query,
            original: request.query || Selectors.query(state)
          },
          page: {
            ...presentState.page,
            current: request.page || Selectors.page(state),
            sizes: {
              ...Selectors.pageSizes(state),
              selected: pageSizeIndex === -1 ? Selectors.pageSizeIndex(state) : pageSizeIndex
            }
          },
          collections: {
            ...Selectors.collections(state),
            selected: request.collection || Selectors.collection(state)
          },
          sorts: {
            ...Selectors.sorts(state),
            selected: currentSortIndex === -1 ? Selectors.sortIndex(state) : currentSortIndex
          },
          navigations: {
            ...presentState.navigations,
            allIds: navigationsAllIds.length > 0 ? navigationsAllIds : presentState.navigations.allIds,
            byId: Object.keys(navigationsByIds).length > 0 ? navigationsByIds : presentState.navigations.byId
          }
        }
      }
    };
  }
}

namespace UrlService {
  export interface Options {
    beautifier?: UrlBeautifier.Configuration | UrlBeautifier.Factory;
    routes?: Routes;
    redirects?: { [target: string]: string };
    urlHandler?: (url: string) => void;
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
