import { Events, Routes } from '@storefront/flux-capacitor';
import { core, BaseService } from '../core/service';
import StoreFront from '../storefront';

@core
class DetailsService extends BaseService<DetailsService.Options> {
  constructor(app: StoreFront, opts: any) {
    super(app, opts);
    this.app.flux.on(Events.DETAILS_CHANGED, this.fetchDetails);
  }

  init() {
    // no-op
  }

  fetchDetails = () => {
    this.app.flux.saveState(Routes.DETAILS);
  }
}

namespace DetailsService {
  export interface Options {}
}

export default DetailsService;
