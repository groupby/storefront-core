import { utils, Service } from '../core';
import { core } from '../core/system';
import StoreFront from '../storefront';

@core
class Logging implements Service {

  constructor(private app: StoreFront, opts: Logging.Options) {
    utils.log.setLevel(opts.level);
  }

  init() {
    this.app.log = utils.log;
  }
}

namespace Logging {
  export interface Options {
    level?: string;
  }
}

export default Logging;
