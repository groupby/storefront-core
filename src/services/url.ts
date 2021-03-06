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

  constructor(app: StoreFront, opts: UrlService.Options) {
    super(app, opts);
    if (typeof this.opts.beautifier === 'function') {
      this.beautifier = this.opts.beautifier(this.app, this.generateRoutes());
    } else {
      this.beautifier = new UrlBeautifier(this.generateRoutes(), this.opts.beautifier, this.app.config);
    }
    WINDOW().addEventListener('popstate', this.rewind);
  }

  init() {
    this.listenForHistoryChange();
    this.handleUrl();
  }

  handleUrl() {
    try {
      this.handleCurrentLocation();
    } catch (e) {
      this.app.log.warn('unable to parse state from url', e);
    }
  }

  handleCurrentLocation() {
    const parsed = <any>this.beautifier.parse<UrlBeautifier.SearchUrlState>(WINDOW().location.href);
    return Promise.resolve(parsed)
      .then((resp) => {
        const { route, request: urlState } = resp;
        this.triggerRequest(route, urlState);
      })
      .catch((e) => {
        this.app.log.warn('UrlService parse promise failed', e);
      });
  }

  triggerRequest(route: string, urlState: UrlBeautifier.SearchUrlState | UrlBeautifier.DetailsUrlState) {
    let request;
    let newState;
    switch (route) {
      case Routes.SEARCH:
        request = Utils.searchStateToRequest(<UrlBeautifier.SearchUrlState>urlState, this.app.flux.store.getState());
        newState = Utils.mergeSearchState(this.app.flux.store.getState(), <UrlBeautifier.SearchUrlState>urlState);
        this.refreshState(newState);
        this.app.flux.store.dispatch(this.app.flux.actions.fetchProductsWhenHydrated({ request }));
        break;
      case Routes.PAST_PURCHASE:
        request = Utils.pastPurchaseStateToRequest(<UrlBeautifier.SearchUrlState>urlState, this.app.flux.store.getState());
        newState = Utils.mergePastPurchaseState(this.app.flux.store.getState(), <UrlBeautifier.SearchUrlState>urlState);
        this.refreshState(newState);
        this.app.flux.store.dispatch(this.app.flux.actions.fetchPastPurchaseProducts({ request }));
        break;
      case Routes.DETAILS:
        this.app.flux.store.dispatch(
          this.app.flux.actions.fetchProductDetails({ id: (<UrlBeautifier.DetailsUrlState>urlState).data.id })
        );
        break;
    }
  }

  generateRoutes() {
    const basePath = Utils.getBasePath();
    const routes = this.opts.routes;

    return Object.keys(routes).reduce(
      (generatedRoutes: any, prop) => Object.assign(generatedRoutes, { [prop]: basePath + routes[prop] }),
      {}
    );
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
        const oldUrl = WINDOW().location.href;
        WINDOW().history.pushState(
          { url, state: this.filterState(this.app.flux.store.getState()), app: STOREFRONT_APP_ID },
          '',
          url
        );

        const newUrl = WINDOW().location.href;
        this.emitUrlUpdated(oldUrl, newUrl, url);
        this.handleUrl();
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
      const oldUrl = WINDOW().location.href;
      const state = this.app.flux.store.getState();
      WINDOW().history.replaceState(
        {
          url,
          state: this.filterState(state),
          app: STOREFRONT_APP_ID,
        },
        WINDOW().document.title,
        url
      );

      const newUrl = WINDOW().location.href;
      this.emitUrlUpdated(oldUrl, newUrl, url);
    } catch (e) {
      this.app.log.warn('unable to replace browser history', e);
    }
  }

  emitUrlUpdated(oldUrl: string, newUrl: string, payload: string) {
    if (oldUrl !== newUrl) {
      this.app.flux.emit(Events.URL_UPDATED, payload);
    }
  }

  filterState(state: Store.State) {
    const { session: { config, ...session }, data, ...rootConfig } = state;
    const products = this.app.config.history.length === 0 ? [] : data.present.products;

    return {
      ...rootConfig,
      session,
      data: {
        ...data,
        past: [],
        present: { ...data.present, products },
      },
    };
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

  refreshState(state: any): Promise<any> {
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
    pastpurchase: string;
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
