import { Events } from '@storefront/flux-capacitor';
import { BaseService } from '../core/service';
import StoreFront from '../storefront';

class RecommendationsService extends BaseService {

  init() {
    this.app.flux.store.dispatch(this.app.flux.actions.fetchRecommendationsProducts());
  }
}

export default RecommendationsService;
