import { Events } from '@storefront/flux-capacitor';
import { core, BaseService } from '../core/service';
import { WINDOW } from '../core/utils';

@core
class RedirectService extends BaseService<RedirectService.Options> {

  init() {
    this.app.flux.on(Events.REDIRECT, this.redirect);
  }

  redirect(url: string) {
    WINDOW().location.replace(url);
  }
}

namespace RedirectService {
  export interface Options {}
}

export default RedirectService;
