import { Events } from '@storefront/flux-capacitor';
import { core, BaseService } from '../core/service';
import StoreFront from '../storefront';

@core
class DetailsService extends BaseService {

  init() {
    this.app.flux.on(Events.DETAILS_ID_UPDATED, this.fetchDetails);
  }

  fetchDetails = (id: string) => this.app.flux.details(id);
}

export default DetailsService;
