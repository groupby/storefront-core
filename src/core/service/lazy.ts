import { BaseService } from '.';
import { SystemServices } from '../../services';
import StoreFront from '../../storefront';

abstract class LazyService<T = any> extends BaseService<T> {

  initialized: boolean = false;
  registered: any[] = [];

  init() {
    // no-op
  }

  abstract lazyInit(services: SystemServices);

  register(tag: any) {
    this.registered.push(tag);
    if (!this.initialized) {
      this.initialized = true;
      this.lazyInit(this.app.services);
    }
  }
}

export default LazyService;
