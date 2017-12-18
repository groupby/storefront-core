import { Events } from '@storefront/flux-capacitor';
import { core, BaseService } from '../core/service';
import StoreFront from '../storefront';

class PastPurchaseService extends BaseService<PastPurchaseService.Options> {

  constructor(app: StoreFront, opts: any) {
    super(app, opts);
    this.app.flux.on(Events.AUTOCOMPLETE_QUERY_UPDATED, () => this.app.flux.actions.receiveSaytPastPurchases([]));
  }

  init() {
    this.app.flux.store.dispatch(this.app.flux.actions.fetchPastPurchases());
  }
}

namespace PastPurchaseService {
  export interface Options { }
}

export default PastPurchaseService;
