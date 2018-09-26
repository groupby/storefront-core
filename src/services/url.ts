import { Actions, Events, Routes, Selectors, Store } from '@storefront/flux-capacitor';
import * as UrlParse from 'url-parse';
import CoreSelectors from '../core/selectors';
import { core, BaseService } from '../core/service';
import UrlBeautifier from '../core/url-beautifier';
import { WINDOW } from '../core/utils';
import StoreFront from '../storefront';
import Utils from './urlUtils';

export const STOREFRONT_APP_ID = 'GroupBy StoreFront';

@core
class UrlService extends BaseService<UrlService.Options> {
  static getBasePath: typeof Utils.getBasePath = Utils.getBasePath;

  beautifier: UrlBeautifier.SimpleBeautifier;

  urlState: UrlService.UrlStateFunctions = {
    search: Utils.searchUrlState,
    details: Utils.detailsUrlState,
    navigation: Utils.navigationUrlState,
    pastpurchase: Utils.pastPurchaseUrlState,
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
    try {
      this.handleCurrentLocation(this.handleUrl.bind(this));
    } catch (e) {
      this.app.log.warn('unable to parse state from url', e);
      this.listenForHistoryChange();
    }
  }

  handleUrlWithoutListeners() {
    try {
      this.handleCurrentLocation(this.handleUrlWithoutAugment.bind(this));
    } catch (e) {
      this.app.log.warn('unable to parse state from url', e);
    }
  }

  handleCurrentLocation(handleReq: (route: string, request: UrlBeautifier.SearchUrlState) => void) {
    const parsed = <any>this.beautifier.parse<UrlBeautifier.SearchUrlState>(WINDOW().location.href);
    if (typeof parsed.then === 'function') {
      parsed.then((resp) => {
        if (resp) {
          const { route, request } = resp;
          handleReq(route, request);
        }
      }).catch((e) => {
        this.app.log.warn('UrlService parse promise failed', e);
      });
    } else {
      const { route, request } = parsed;
      handleReq(route, request);
    }
  }

  handleUrl(route: string, request: UrlBeautifier.SearchUrlState) {
    if (route === Routes.SEARCH || route === Routes.PAST_PURCHASE) {
      const newState =
        route === Routes.SEARCH ? Utils.mergeSearchState(this.app.flux.store.getState(), request) :
        Utils.mergePastPurchaseState(this.app.flux.store.getState(), request);
      const unsubscribe = this.app.flux.store.subscribe(() => {
        unsubscribe();
        this.augmentHistory(route, request);
      });
      this.refreshState(newState);
    } else {
      this.augmentHistory(route, request);
    }
  }

  handleUrlWithoutAugment(route: string, request: any) {
    let newState;
    switch (route) {
      case Routes.SEARCH:
        newState = Utils.mergeSearchState(this.app.flux.store.getState(), request);
        this.refreshState(newState);
        this.app.flux.store.dispatch(this.app.flux.actions.fetchProductsWhenHydrated());
        break;
      case Routes.PAST_PURCHASE:
        newState = Utils.mergePastPurchaseState(this.app.flux.store.getState(), request);
        this.refreshState(newState);
        this.app.flux.store.dispatch(<any>this.app.flux.actions.fetchPastPurchaseProducts());
        break;
      case Routes.DETAILS:
        this.app.flux.store.dispatch(this.app.flux.actions.fetchProductDetails(request.id));
        break;
    }
  }

  generateRoutes() {
    const basePath = Utils.getBasePath();
    const routes = this.opts.routes;

    return Object.keys(routes)
      .reduce((generatedRoutes: any, prop) =>
        Object.assign(generatedRoutes, { [prop]: basePath + routes[prop] }), {});
  }

  augmentHistory(route: string, request: any) {
    const { pathname, search, hash } = WINDOW().location;
    const url = pathname + search + hash;

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
      case Routes.PAST_PURCHASE:
        this.app.flux.store.dispatch(<any>this.app.flux.actions.fetchPastPurchaseProducts());
        break;
    }
  }

  listenForHistoryChange = () => {
    this.app.flux.on(Events.HISTORY_SAVE, this.updateHistory);
    this.app.flux.on(Events.HISTORY_REPLACE, this.buildUrlAndReplaceHistory);
  }

  updateHistory = ({ state, route }: { state: Store.State, route: string }) => {
    const url = this.beautifier.build(route, this.urlState[route](state));

    if (typeof this.opts.urlHandler === 'function') {
      this.opts.urlHandler(url);
    } else if (typeof this.opts.redirects === 'function' && this.opts.redirects(url)) {
      WINDOW().location.assign(this.opts.redirects(url));
    } else if (this.opts.redirects[url]) {
      WINDOW().location.assign(this.opts.redirects[url]);
    } else {
      try {
        WINDOW().history.pushState({ url, state: this.filterState(state), app: STOREFRONT_APP_ID }, '', url);
        this.app.flux.emit(Events.URL_UPDATED, url);
        this.handleUrlWithoutListeners();
      } catch (e) {
        this.app.log.warn('unable to push state to browser history', e);
      }
    }
  }

  buildUrlAndReplaceHistory = ({ state, route }: { state: Store.State, route: string }) => {
    const url = this.beautifier.build(route, this.urlState[route](state));
    this.replaceHistory(url);
  }

  replaceHistory(url: string) {
    try {
      const state = this.app.flux.store.getState();
      WINDOW().history.replaceState({
        url,
        state: this.filterState(state),
        app: STOREFRONT_APP_ID
      }, WINDOW().document.title, url);
      this.refreshState(state, true);
    } catch (e) {
      this.app.log.warn('unable to replace browser history', e);
    }
  }

  filterState(state: Store.State) {
    const { session: { config, ...session }, ...rootConfig } = state;
    if (this.app.config.history.length === 0) {
      const data = { ...rootConfig.data, present: { ...rootConfig.data.present, products: [] } };
      return { ...rootConfig, session, data };
    }
    return { ...rootConfig, session };
  }

  rewind = (event: PopStateEvent) => {
    const eventState = event.state;
    if (eventState && event.state.app === STOREFRONT_APP_ID) {
      this.refreshState(eventState.state);
      if (this.app.config.history.length === 0) {
        this.app.flux.store.dispatch(this.app.flux.actions.fetchProductsWithoutHistory());
      }
      this.app.flux.emit(Events.URL_UPDATED, WINDOW().location.href);
    }
  }

  refreshState(state: any, replace: boolean = false): Promise<any> {
    return <any>this.app.flux.store.dispatch(this.app.flux.actions.refreshState(state));
  }
}

namespace UrlService {
  export interface Options {
    beautifier?: UrlBeautifier.Configuration | UrlBeautifier.Factory;
    routes?: Routes;
    redirects?: { [target: string]: string } | ((url: string) => any);
    urlHandler?: (url: string) => void;
  }

  export interface Routes {
    search: string;
    details: string;
    navigation: string;
    pastPurchase: string;
  }

  export type UrlStateFunction = (state: any) => any;

  export interface UrlStateFunctions {
    search: UrlStateFunction;
    details: UrlStateFunction;
    navigation: UrlStateFunction;
    pastpurchase: UrlStateFunction;
  }
}

export default UrlService;
