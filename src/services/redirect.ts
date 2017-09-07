import { Events } from '@storefront/flux-capacitor';
import { core, BaseService } from '../core/service';
import { WINDOW } from '../core/utils';

@core
export default class RedirectService extends BaseService<any> {

  init() {
    this.app.flux.on(Events.REDIRECT, this.redirect);
  }

  redirect = (url: string) => WINDOW().location.assign(url);
}
