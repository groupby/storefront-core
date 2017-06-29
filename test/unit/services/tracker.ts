import { Events } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import ProductTransformer from '../../../src/core/product-transformer';
import { BaseService, CORE } from '../../../src/core/service';
import * as utils from '../../../src/core/utils';
import Service, { TRACKER_EVENT } from '../../../src/services/tracker';
import StoreFront from '../../../src/storefront';
import suite from '../_suite';

const USER_TRANSFORM = () => null;
const STRUCTURE = { y: 'z' };
const CUSTOMER_ID = 'myCustomer';
const AREA = 'myArea';

suite('Tracker Service', ({ expect, spy, stub }) => {
  let app: StoreFront;
  let opts: Service.Options;
  let service: Service;
  let tracker: sinon.SinonStub;
  let transformer: sinon.SinonStub;
  let on: sinon.SinonSpy;

  beforeEach(() => {
    on = spy();
    app = <any>{ config: { customerId: CUSTOMER_ID, area: AREA, structure: STRUCTURE }, flux: { on } };
    opts = {};
    tracker = stub(utils, 'GbTracker');
    transformer = stub(ProductTransformer, 'transformer').returns(USER_TRANSFORM);
    service = new Service(app, opts);
  });

  describe('constructor()', () => {
    it('should initialize GbTracker client', () => {
      expect(tracker).to.be.calledWith(CUSTOMER_ID, AREA);
    });

    it('should initialize ProductTransformer', () => {
      expect(transformer).to.be.calledWith(STRUCTURE);
      expect(service.transform).to.eq(USER_TRANSFORM);
    });

    it('should listen for events', () => {
      expect(on).to.have.callCount(6)
        .and.calledWith(Events.BEACON_SEARCH, service.sendSearchEvent)
        .and.calledWith(Events.BEACON_VIEW_CART, service.sendViewCartEvent)
        .and.calledWith(Events.BEACON_ADD_TO_CART, service.sendAddToCartEvent)
        .and.calledWith(Events.BEACON_REMOVE_FROM_CART, service.sendRemoveFromCartEvent)
        .and.calledWith(Events.BEACON_VIEW_PRODUCT, service.sendViewProductEvent)
        .and.calledWith(Events.BEACON_ORDER, service.sendOrderEvent);
    });
  });

  describe('init()', () => {
    it('should setup visitor information', () => {
      const autoSetVisitor = spy();
      const visitorId = app.config.visitorId = '1234';
      opts.warnings = true;
      service.client = <any>{ autoSetVisitor, disableWarnings: () => expect.fail() };

      service.init();

      expect(autoSetVisitor).to.be.calledWith(visitorId);
    });

    it('should disable warnings', () => {
      const disableWarnings = spy();
      const visitorId = app.config.visitorId = '1234';
      service.client = <any>{ disableWarnings, autoSetVisitor: () => null };

      service.init();

      expect(disableWarnings).to.be.called;
    });
  });

  describe('sendEvent()', () => {
    it('should emit TRACKER_EVENT and send event', () => {
      const method = 'sendAutoSearchEvent';
      const event = { a: 'b' };
      const emit = app.flux.emit = spy();
      const send = service.client[method] = spy();

      service.sendEvent(method, event);

      expect(emit).to.be.calledWith(TRACKER_EVENT);
      expect(send).to.be.calledWith(event);
    });

    it('should handle errors from tracker client', () => {
      const method = 'sendAutoSearchEvent';
      const error = new Error();
      const logError = spy();
      app.flux.emit = () => null;
      service.client[method] = stub().throws(error);
      app.log = <any>{ error: logError };

      service.sendEvent(method, {});

      expect(logError).to.be.calledWith('unable to send beaconing data', error);
    });
  });

  describe('sendSearchEvent()', () => {
    const id = '12345';
    const metadata = { a: 'b' };

    it('should send search event with origin and metadata', () => {
      const origin = 'myOrigin';
      const tagOrigin = { origin };
      const sendEvent = service.sendEvent = spy();
      const getMetadata = service.getMetadata = spy(() => metadata);
      service.getSearchOrigin = (): any => tagOrigin;

      service.sendSearchEvent(id);

      expect(sendEvent).to.be.calledWith('sendAutoSearchEvent', {
        metadata,
        search: { id, origin: { [origin]: true }, },
      });
      expect(getMetadata).to.be.calledWith(tagOrigin);
    });

    it('should fall back to default search origin with empty origin', () => {
      const sendEvent = service.sendEvent = spy();
      service.getMetadata = spy(() => metadata);
      service.getSearchOrigin = (): any => ({});

      service.sendSearchEvent(id);

      expect(sendEvent).to.be.calledWith('sendAutoSearchEvent', {
        metadata,
        search: { id, origin: { search: true }, },
      });
    });

    it('should fall back to default search origin with no origin', () => {
      const sendEvent = service.sendEvent = spy();
      service.getMetadata = spy(() => metadata);
      service.getSearchOrigin = () => null;

      service.sendSearchEvent(id);

      expect(sendEvent).to.be.calledWith('sendAutoSearchEvent', {
        metadata,
        search: { id, origin: { search: true }, },
      });
    });

  });

  describe('sendViewCartEvent()', () => {
    it('should send event with metadata', () => {
      const event: any = { a: 'b' };
      const withMetadata = { c: 'd' };
      const sendEvent = service.sendEvent = spy();
      const addMetadata = service.addMetadata = spy(() => withMetadata);

      service.sendViewCartEvent(event);

      expect(addMetadata).to.be.calledWith(event);
      expect(sendEvent).to.be.calledWith('sendViewCartEvent', withMetadata);
    });
  });

  describe('sendAddToCartEvent()', () => {
    it('should send event with metadata', () => {
      const event: any = { a: 'b' };
      const withMetadata = { c: 'd' };
      const sendEvent = service.sendEvent = spy();
      const addMetadata = service.addMetadata = spy(() => withMetadata);

      service.sendAddToCartEvent(event);

      expect(addMetadata).to.be.calledWith(event);
      expect(sendEvent).to.be.calledWith('sendAddToCartEvent', withMetadata);
    });
  });

  describe('sendRemoveFromCartEvent()', () => {
    it('should send event with metadata', () => {
      const event: any = { a: 'b' };
      const withMetadata = { c: 'd' };
      const sendEvent = service.sendEvent = spy();
      const addMetadata = service.addMetadata = spy(() => withMetadata);

      service.sendRemoveFromCartEvent(event);

      expect(addMetadata).to.be.calledWith(event);
      expect(sendEvent).to.be.calledWith('sendRemoveFromCartEvent', withMetadata);
    });
  });

  describe('sendOrderEvent()', () => {
    it('should send event with metadata', () => {
      const event: any = { a: 'b' };
      const withMetadata = { c: 'd' };
      const sendEvent = service.sendEvent = spy();
      const addMetadata = service.addMetadata = spy(() => withMetadata);

      service.sendOrderEvent(event);

      expect(addMetadata).to.be.calledWith(event);
      expect(sendEvent).to.be.calledWith('sendOrderEvent', withMetadata);
    });
  });

  describe('sendViewProductEvent()', () => {
    it('should send event with metadata', () => {
      const id = '1234';
      const collection = 'myCollection';
      const title = 'top hat';
      const price = 132.40;
      const allMeta = { a: 'b' };
      const withMetadata = { c: 'd' };
      const sendEvent = service.sendEvent = spy();
      const addMetadata = service.addMetadata = spy(() => withMetadata);
      service.transform = spy(() => ({ data: { id, title, price } }));

      service.sendViewProductEvent({ allMeta, collection });

      expect(addMetadata).to.be.calledWith({
        product: {
          productId: id,
          title,
          price,
          collection
        }
      });
      expect(sendEvent).to.be.calledWith('sendViewProductEvent', withMetadata);
    });
  });

  describe('addMetadata()', () => {
    it('should extend event metadata with available tag metadata', () => {
      service.getMetadata = (): any[] => ['c', 'd'];

      const withMetadata = service.addMetadata({ metadata: ['a', 'b'] });

      expect(withMetadata).to.eql({ metadata: ['a', 'b', 'c', 'd'] });
    });

    it('should create metadata on event', () => {
      service.getMetadata = (): any[] => ['c', 'd'];

      const withMetadata = service.addMetadata({});

      expect(withMetadata).to.eql({ metadata: ['c', 'd'] });
    });
  });

  describe('getSearchOrigin()', () => {
    it('should extract the search origin', () => {
      const origin = { a: 'b' };
      app.flux.store = <any>{ getState: () => ({ session: { origin } }) };

      expect(service.getSearchOrigin()).to.eq(origin);
    });
  });

  describe('getMetadata()', () => {
    it('should return metadata from tag origin', () => {
      const name = 'myTag';

      const metadata = service.getMetadata(<any>{ name, id: 413 });

      expect(metadata).to.eql([{ key: 'tagName', value: name }, { key: 'tagId', value: '413' }]);
    });

    it('should return empty array if no origin', () => {
      const metadata = service.getMetadata(null);

      expect(metadata).to.eql([]);
    });
  });
});
