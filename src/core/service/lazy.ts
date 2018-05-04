import { BaseService } from '.';
import { SystemServices } from '../../services';
import StoreFront from '../../storefront';
import Tag from '../tag';

abstract class LazyService<T = any> extends BaseService<T> {

  registered: any[] = [];

  init() {
    // no-op
  }

  abstract lazyInit(services: SystemServices);

  register(tag: Tag) {
    if (this.registered.push(tag) === 1) {
      this.lazyInit(this.app.services);
    }

    const index = this.registered.length - 1;
    tag.one('unmount', () => this.registered.splice(index, 1));
  }
}

export default LazyService;
