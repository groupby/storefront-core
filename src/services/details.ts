import { Events } from '@storefront/flux-capacitor';
import { core, BaseService } from '../core/service';
import StoreFront from '../storefront';

@core
class DetailsService extends BaseService {

  constructor(app: StoreFront, opts: any) {
    super(app, opts);
    this.app.flux.on(Events.DETAILS_UPDATED, this.fetchDetails);
  }

  init() {
    // no-op
  }

  fetchDetails = (id: string) => this.app.flux.store.dispatch(<any>this.app.flux.actions.fetchProductDetails(id));
}

export default DetailsService;
