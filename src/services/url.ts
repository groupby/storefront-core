import { Events, Selectors, Store } from '@storefront/flux-capacitor';
import { core } from '../core/decorators';
import { BaseService } from '../core/service';
import UrlBeautifier from '../core/url-beautifier';
import { WINDOW } from '../core/utils';
import StoreFront from '../storefront';

export const STOREFRONT_APP_ID = 'GroupBy StoreFront';

@core
class UrlService extends BaseService<UrlService.Options> {

  beautifier: UrlBeautifier;

  init() {
    this.beautifier = new UrlBeautifier(this.opts.routes, this.opts.beautifier);
    WINDOW.addEventListener('popstate', this.rewind);
    this.readInitialUrl();
  }

  readInitialUrl() {
    try {
      const request = this.beautifier.parse<UrlBeautifier.SearchRequest>(WINDOW.location().href);
      const newState = UrlService.mergeSearchState(this.app.flux.store.getState(), request);

      const unsubscribe = this.app.flux.store.subscribe(() => {
        unsubscribe();
        this.augmentHistory();
      });

      this.refreshState(newState);
    } catch (e) {
      this.app.log.warn('unable to parse state from url', e);
      this.listenForHistoryChange();
    }
  }

  augmentHistory() {
    const location = WINDOW.location();
    const state = this.app.flux.store.getState();
    const url = location.pathname + location.search;

    WINDOW.history().replaceState({ url, state: state.data, app: STOREFRONT_APP_ID }, WINDOW.document().title, url);
    this.app.flux.once(Events.HISTORY_SAVE, this.listenForHistoryChange);
    this.app.flux.store.dispatch(<any>this.app.flux.actions.fetchProducts());
  }

  listenForHistoryChange = () => {
    this.app.flux.on(Events.HISTORY_SAVE, this.updateHistory);
  }

  updateHistory = (state: Store.State) => {
    const urlState: UrlBeautifier.SearchRequest = {
      query: Selectors.query(state),
      page: state.data.page.current,
      pageSize: Selectors.pageSize(state),
      refinements: Selectors.selectedRefinements(state)
    };
    const url = this.beautifier.build('search', urlState);

    WINDOW.history().pushState({ url, state: state.data, app: STOREFRONT_APP_ID }, urlState.query, url);
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

  static mergeSearchState(state: Store.State, request: UrlBeautifier.SearchRequest) {
    const currentState = state.data;
    const pageSizeIndex = currentState.page.sizes.items.indexOf(request.pageSize);

    return {
      ...currentState,
      query: {
        ...currentState.query,
        original: request.query
      },
      page: {
        ...currentState.page,
        current: request.page,
        sizes: {
          ...currentState.page.sizes,
          selected: pageSizeIndex === -1 ? currentState.page.sizes.selected : pageSizeIndex
        }
      },
      navigations: {
        ...currentState.navigations,
        allIds: request.refinements.reduce((fields, refinement) => {
          if (!fields.includes(refinement.navigationName)) {
            fields.push(refinement.navigationName);
          }
          return fields;
        }, []),
        byId: request.refinements.reduce((navigations, refinement) => {
          const field = refinement.navigationName;
          const transformed = refinement.type === 'Range'
            ? { low: refinement.low, high: refinement.high }
            : { value: refinement.value };

          if (field in navigations) {
            const navigation = navigations[field];
            navigation.selected.push(navigation.refinements.push(transformed) - 1);
          } else {
            navigations[field] = <Store.Navigation>{
              field,
              label: field,
              range: refinement.type === 'Range',
              refinements: [transformed],
              selected: [0]
            };
          }

          return navigations;
        }, {})
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
}

export default UrlService;
