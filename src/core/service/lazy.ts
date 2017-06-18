import { BaseService } from '.';
import { SystemServices } from '../../services';
import StoreFront from '../../storefront';

abstract class LazyService<T = any> extends BaseService<T> {

  registered: any[] = [];

  init() {
    // no-op
  }

  abstract lazyInit(services: SystemServices);

  register(tag: any) {
    if (this.registered.push(tag) === 1) {
      this.lazyInit(this.app.services);
    }
  }
}

export default LazyService;
