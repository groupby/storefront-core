import FluxCapacitor, { Events, Selectors, Store } from '@storefront/flux-capacitor';
import { core } from '../core/service';
import LazyService from '../core/service/lazy';
import StoreFront from '../storefront';

@core
class CollectionsService extends LazyService {
  lazyInit() {
    this.fetchCollectionCounts();
    this.app.flux.on(Events.RECALL_CHANGED, this.waitForResults);
  }

  waitForResults = () => this.app.flux.once(Events.PRODUCTS_UPDATED, this.fetchCollectionCounts);

  fetchCollectionCounts = () => {
    const state = this.app.flux.store.getState();
    const selected = Selectors.collection(state);
    Selectors.collections(state)
      .allIds.filter((collection) => collection !== selected)
      .forEach((collection) => this.app.flux.countRecords(collection));
  }
}

export default CollectionsService;
