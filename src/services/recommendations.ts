import { Events } from '@storefront/flux-capacitor';
import { core, BaseService } from '../core/service';
import StoreFront from '../storefront';

class RecommendationsService extends BaseService<RecommendationsService.Options> {

  init() {
    this.app.flux.store.dispatch(this.app.flux.actions.fetchRecommendationsProducts());
  }
}

namespace RecommendationsService {
  export interface Options {}
}

export default RecommendationsService;
