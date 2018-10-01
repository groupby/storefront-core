import { Events, Routes } from '@storefront/flux-capacitor';
import { core, BaseService } from '../core/service';
import StoreFront from '../storefront';

class PastPurchaseService extends BaseService<PastPurchaseService.Options> {

  constructor(app: StoreFront, opts: any) {
    super(app, opts);

    this.app.flux.on(Events.AUTOCOMPLETE_QUERY_UPDATED, () => this.app.flux.actions.receiveSaytPastPurchases([]));
    this.app.flux.on(Events.PAST_PURCHASE_CHANGED, this.fetchProducts, this);
  }

  init() {
    this.app.flux.store.dispatch(this.app.flux.actions.fetchPastPurchases());
  }

  fetchProducts() {
    this.app.flux.saveState(Routes.PAST_PURCHASE);
  }
}

namespace PastPurchaseService {
  export interface Options { }
}

export default PastPurchaseService;
