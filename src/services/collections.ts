import FluxCapacitor, { Events, Selectors, Store } from '@storefront/flux-capacitor';
import { core } from '../core/decorators';
import LazyService from '../core/service/lazy';
import StoreFront from '../storefront';

@core
class CollectionsService extends LazyService {

  lazyInit() {
    this.app.flux.on(Events.RECALL_CHANGED, this.waitForResults);
  }

  waitForResults = () => this.app.flux.once(Events.FETCH_SEARCH_DONE, this.fetchCollectionCounts);

  fetchCollectionCounts = () => {
    const state = this.app.flux.store.getState();
    const selected = Selectors.collection(state);
    state.data.collections.allIds.filter((collection) => collection !== selected)
      .forEach((collection) => this.app.flux.countRecords(collection));
  }
}

export default CollectionsService;
