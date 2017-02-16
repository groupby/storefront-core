import * as log from 'loglevel';
import StoreFront from '../storefront';
import Service from './service';

export default class Logging extends Service<any> {

  constructor(app: StoreFront) {
    super(Object.assign(app, { log }));
  }

  // tslint:disable-next-line no-empty
  init() { }
}
