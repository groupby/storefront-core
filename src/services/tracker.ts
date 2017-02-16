import * as TrackerClient from 'gb-tracker-client';
import { defaults } from '../decorators';
import StoreFront from '../storefront';
import Service from './service';
// import { ProductTransformer } from '../utils/product-transformer';
// import filterObject = require('filter-object');
// import { Events, FluxCapacitor } from 'groupby-api';
// import * as Cookies from 'js-cookie';
// import * as uuid from 'uuid';

export const MAX_COOKIE_AGE = 365; // days
export const VISITOR_COOKIE_KEY = 'visitor';
export const SESSION_COOKIE_KEY = 'session';

export const DEFAULTS = {
  warnings: true,
  metadata: {}
};

namespace Tracker {
  export interface Configuration {
    warnings?: boolean;
    metadata?: {
      _search?: any;
      _viewProduct?: any;
    } & any;
  }
}

@defaults(DEFAULTS)
class Tracker extends Service<Tracker.Configuration> {

  tracker: typeof TrackerClient;
  // transformer: ProductTransformer;

  constructor(app: StoreFront) {
    super(app);
    this.tracker = new TrackerClient(app.config.customerId, app.config.area);
    // this.transformer = new ProductTransformer(this.config.structure || {});
  }

  init() {
    // if (!this._config.warnings) {
    //   this.tracker.disableWarnings();
    // }

    // this.setVisitorInfo();
    // this.listenForViewProduct();
  }

  // setVisitorInfo() {
  //   const visitorId = this.config.visitorId
  //     || Cookies.get(VISITOR_COOKIE_KEY)
  //     || uuid.v1();
  //   const sessionId = this.config.sessionId
  //     || Cookies.get(SESSION_COOKIE_KEY)
  //     || uuid.v1();
  //
  //   this.setVisitor(visitorId, sessionId);
  // }
  //
  // listenForViewProduct() {
  //   this.flux.on(Events.DETAILS, ({ allMeta }) => {
  //     const [metadata] = this.transformer.transform(allMeta);
  //     this.tracker.sendViewProductEvent({
  //       metadata: this.generateMetadata('viewProduct'),
  //       product: {
  //         productId: metadata.id,
  //         title: metadata.title,
  //         price: metadata.price,
  //         category: 'NONE'
  //       }
  //     });
  //   });
  // }
  //
  // setVisitor(visitorId: string, sessionId: string) {
  //   this.tracker.setVisitor(visitorId, sessionId);
  //
  //   Cookies.set(VISITOR_COOKIE_KEY, visitorId, { expires: MAX_COOKIE_AGE });
  //   Cookies.set(SESSION_COOKIE_KEY, sessionId);
  // }
  //
  // search() {
  //   this.sendSearchEvent();
  // }
  //
  // didYouMean() {
  //   this.sendSearchEvent('dym');
  // }
  //
  // sayt() {
  //   this.sendSearchEvent('sayt');
  // }
  //
  // addToCart(productsInfo: any) {
  //   this.tracker.sendAddToCartEvent(productsInfo);
  // }
  //
  // order(productsInfo: any) {
  //   this.tracker.sendOrderEvent(productsInfo);
  // }
  //
  // generateMetadata(type?: 'search' | 'viewProduct') {
  //   const metadata = Object.assign({},
  //     filterObject(this._config.metadata, '!{_search,_viewProduct}'),
  //     type ? this._config.metadata[`_${type}`] : {});
  //   return Object.keys(metadata)
  //     .map((key) => ({ key, value: metadata[key] }));
  // }
  //
  // sendSearchEvent(origin: string = 'search') {
  //   const convertedRecords = this.flux.results.records.map((record) => Object.assign({
  //     _id: record.id,
  //     _u: record.url,
  //     _t: record.title,
  //   }, filterObject(record, '!{id,url,title}')));
  //
  //   this.tracker.sendSearchEvent({
  //     metadata: this.generateMetadata('search'),
  //     search: Object.assign({
  //       origin: { [origin]: true },
  //       query: this.flux.results.originalQuery || ''
  //     }, this.flux.results, {
  //         records: convertedRecords
  //       })
  //   });
  // }
}

export default Tracker;
