import { Events, Selectors, Store } from '@storefront/flux-capacitor';
import { core } from '../core/decorators';
import { BaseService } from '../core/service';
import UrlBeautifier from '../core/url-beautifier';
import StoreFront from '../storefront';

const STOREFRONT_APP_ID = 'GroupBy StoreFront';

@core
class UrlService extends BaseService<UrlService.Options> {

  beautifier: UrlBeautifier;

  init() {
    this.beautifier = new UrlBeautifier(this.opts.routes, this.opts.beautifier);
    window.addEventListener('popstate', this.rewind);
    this.readInitialUrl();
  }

  readInitialUrl() {
    try {
      const request = this.beautifier.parse<UrlBeautifier.SearchRequest>(window.location.href);
      const currentState = this.app.flux.store.getState().data;
      const pageSizeIndex = currentState.page.sizes.items.indexOf(request.pageSize);
      // TODO this should probably go somewhere else
      const newState = {
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

      this.refreshState(newState)
        .then(() => {
          const state = this.app.flux.store.getState();
          const url = window.location.pathname + window.location.search;

          window.history.replaceState({ url, state: state.data, app: STOREFRONT_APP_ID }, document.title, url);
          this.app.flux.once(Events.HISTORY_SAVE, this.listenForHistoryChange);
          this.app.flux.store.dispatch(<any>this.app.flux.actions.fetchProducts());
        });
    } catch (e) {
      this.app.log.warn('unable to parse state from url', e);
      this.listenForHistoryChange();
    }
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

    window.history.pushState({ url, state: state.data, app: STOREFRONT_APP_ID }, urlState.query, url);
  }

  rewind = (event: PopStateEvent) => {
    const eventState = event.state;
    if (eventState && event.state.app === STOREFRONT_APP_ID) {
      const historyState = eventState.state;
      this.refreshState(historyState);
    }
  }

  refreshState(state: any): Promise<any> {
    return <any>this.app.flux.store.dispatch(this.app.flux.actions.refreshState(state));
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
