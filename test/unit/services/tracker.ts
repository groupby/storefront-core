import { Events } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import ProductTransformer from '../../../src/core/product-transformer';
import * as utils from '../../../src/core/utils';
import Service, { DEFAULT_ORIGINS, TRACKER_EVENT } from '../../../src/services/tracker';
import StoreFront from '../../../src/storefront';
import suite from './_suite';

const USER_TRANSFORM = () => null;
const STRUCTURE = { y: 'z' };
const CUSTOMER_ID = 'myCustomer';
const AREA = 'myArea';

suite('Tracker Service', ({ expect, spy, stub, itShouldExtendBaseService }) => {
  let app: StoreFront;
  let opts: Service.Options;
  let service: Service;
  let tracker: sinon.SinonStub;
  let transformer: sinon.SinonStub;
  let on: sinon.SinonSpy;

  beforeEach(() => {
    on = spy();
    app = <any>{ config: { customerId: CUSTOMER_ID, area: AREA, structure: STRUCTURE }, flux: { on } };
    opts = <any>{
      sendSearchEvent: () => ({}),
      sendViewCartEvent: () => ({}),
      sendAddToCartEvent: () => ({}),
      sendRemoveFromCartEvent: () => ({}),
      sendOrderEvent: () => ({}),
      sendViewProductEvent: () => ({}),
      sendMoreRefinementsEvent: () => ({})
    };
    tracker = stub(utils, 'GbTracker');
    transformer = stub(ProductTransformer, 'transformer').returns(USER_TRANSFORM);
    service = new Service(app, opts);
  });

  describe('constructor()', () => {
    itShouldExtendBaseService(() => service);

    it('should initialize GbTracker client', () => {
      expect(tracker).to.be.calledWith(CUSTOMER_ID, AREA);
    });

    it('should initialize ProductTransformer', () => {
      expect(transformer).to.be.calledWith(STRUCTURE);
      expect(service.transform).to.eq(USER_TRANSFORM);
    });

    it('should listen for events', () => {
      const setListeners = stub(Service.prototype, 'setListeners');

      new Service(app, opts);

      expect(setListeners).to.be.calledWith(app);
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

  describe('setListeners()', () => {
    it('should listen for events', () => {
      const applyOptsOverride = spy(service, 'applyOptsOverride');
      const sendSearchEvent = service.sendSearchEvent = spy();
      const sendViewCartEvent = service.sendViewCartEvent = spy();
      const sendAddToCartEvent = service.sendAddToCartEvent = spy();
      const sendRemoveFromCartEvent = service.sendRemoveFromCartEvent = spy();
      const sendOrderEvent = service.sendOrderEvent = spy();
      const sendViewProductEvent = service.sendViewProductEvent = spy();
      const sendMoreRefinementsEvent = service.sendMoreRefinementsEvent = spy();
      const match = (fn, override) => sinon.match((value) => {
        value();
        expect(applyOptsOverride).to.be.calledWith(fn, override);
        expect(fn).to.be.called;
        return true;
      });
      on = app.flux.on = spy();

      service.setListeners(app);

      expect(on).to.have.callCount(7);
      // tslint:disable max-line-length
      expect(on).to.be.calledWith(Events.BEACON_SEARCH, match(sendSearchEvent, opts.sendSearchEvent));
      expect(on).to.be.calledWith(Events.BEACON_VIEW_CART, match(sendViewCartEvent, opts.sendViewCartEvent));
      expect(on).to.be.calledWith(Events.BEACON_ADD_TO_CART, match(sendAddToCartEvent, opts.sendAddToCartEvent));
      expect(on).to.be.calledWith(Events.BEACON_REMOVE_FROM_CART, match(sendRemoveFromCartEvent, opts.sendRemoveFromCartEvent));
      expect(on).to.be.calledWith(Events.BEACON_ORDER, match(sendOrderEvent, opts.sendOrderEvent));
      expect(on).to.be.calledWith(Events.BEACON_VIEW_PRODUCT, match(sendViewProductEvent, opts.sendViewProductEvent));
      expect(on).to.be.calledWith(Events.BEACON_MORE_REFINEMENTS, match(sendMoreRefinementsEvent, opts.sendMoreRefinementsEvent));
      // tslint:enable
    });
  });

  describe('applyOptsOverride', () => {
    it('should return a function that calls the input function with a value', () => {
      const value = { a: 'b' };
      const fn = spy();

      service.applyOptsOverride(fn, null)(value);

      expect(fn).to.be.calledWithExactly(value);
    });

    it('should return a function that calls the input function with a value and override', () => {
      const value = { a: 'b' };
      const fn = spy();
      const override = () => null;

      service.applyOptsOverride(fn, override)(value);

      expect(fn).to.be.calledWithExactly(value, override);
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

  describe('buildEvent()', () => {
    it('should build and send an event', () => {
      const event: any = { a: 'b' };
      const currentEvent = { c: 'd' };
      const result = { e: 'f' };
      const override = spy(() => result);
      const method: any = 'hello';
      const sendEvent = service.sendEvent = spy();
      stub(service, 'addMetadata').withArgs(event).returns(currentEvent);

      service.buildEvent(override, event);

      expect(override).to.be.calledWithExactly(event, currentEvent);
    });

    it('should build and send an event, applying value', () => {
      const event: any = { a: 'b' };
      const currentEvent = { c: 'd' };
      const result = { e: 'f' };
      const override = spy(() => result);
      const method: any = 'hello';
      const sendEvent = service.sendEvent = spy();
      const value = { g: 'h' };
      stub(service, 'addMetadata').withArgs(event).returns(currentEvent);

      service.buildEvent(override, event, value);

      expect(override).to.be.calledWithExactly(value, currentEvent);
    });
  });

  describe('sendSearchEvent()', () => {
    const id = '12345';
    const metadata = [{ a: 'b' }];

    it('should send search event with origin and metadata', () => {
      const origin = 'myOrigin';
      const tagOrigin = { origin };
      const sendEvent = service.sendEvent = spy();
      const getMetadata = service.getMetadata = spy(() => metadata);
      service.getSearchOrigin = (): any => tagOrigin;

      service.sendSearchEvent(id);

      expect(sendEvent).to.be.calledWith('sendAutoSearchEvent', {
        metadata,
        search: { id, origin: { ...DEFAULT_ORIGINS, [origin]: true }, },
      });
    });

    it('should fall back to default search origin with empty origin', () => {
      const sendEvent = service.sendEvent = spy();
      service.getMetadata = spy(() => metadata);
      service.getSearchOrigin = (): any => ({});

      service.sendSearchEvent(id);

      expect(sendEvent).to.be.calledWith('sendAutoSearchEvent', {
        metadata,
        search: { id, origin: { ...DEFAULT_ORIGINS, search: true }, },
      });
    });

    it('should fall back to default search origin with no origin', () => {
      const sendEvent = service.sendEvent = spy();
      service.getMetadata = spy(() => metadata);
      service.getSearchOrigin = () => null;

      service.sendSearchEvent(id);

      expect(sendEvent).to.be.calledWith('sendAutoSearchEvent', {
        metadata,
        search: { id, origin: { ...DEFAULT_ORIGINS, search: true }, },
      });
    });

    it('should override event with the override function if it exists', () => {
      const sendEvent = service.sendEvent = spy();
      const currEvent = {
        metadata,
        search: { id, origin: { ...DEFAULT_ORIGINS, search: true }, },
      };
      const result = { a: 'b' };
      const override = spy(() => result);
      service.getMetadata = stub().returns(metadata);
      service.getSearchOrigin = () => null;

      service.sendSearchEvent(id, override);

      expect(sendEvent).to.be.calledWith('sendAutoSearchEvent', result);
      expect(override).to.be.calledWithExactly(id, currEvent);
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

    it('should override event with the override function if it exists', () => {
      const event: any = { a: 'b' };
      const withMetadata = { c: 'd' };
      const sendEvent = service.sendEvent = spy();
      const addMetadata = service.addMetadata = spy(() => withMetadata);
      const result = { e: 'f' };
      const override = spy(() => result);

      service.sendViewCartEvent(event, override);

      expect(sendEvent).to.be.calledWith('sendViewCartEvent', result);
      expect(override).to.be.calledWithExactly(event, withMetadata);
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

    it('should override event with the override function if it exists', () => {
      const event: any = { a: 'b' };
      const withMetadata = { c: 'd' };
      const sendEvent = service.sendEvent = spy();
      const addMetadata = service.addMetadata = spy(() => withMetadata);
      const result = { e: 'f' };
      const override = spy(() => result);

      service.sendAddToCartEvent(event, override);

      expect(sendEvent).to.be.calledWith('sendAddToCartEvent', result);
      expect(override).to.be.calledWithExactly(event, withMetadata);
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

    it('should override event with the override function if it exists', () => {
      const event: any = { a: 'b' };
      const withMetadata = { c: 'd' };
      const sendEvent = service.sendEvent = spy();
      const addMetadata = service.addMetadata = spy(() => withMetadata);
      const result = { e: 'f' };
      const override = spy(() => result);

      service.sendRemoveFromCartEvent(event, override);

      expect(sendEvent).to.be.calledWith('sendRemoveFromCartEvent', result);
      expect(override).to.be.calledWithExactly(event, withMetadata);
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

    it('should override event with the override function if it exists', () => {
      const event: any = { a: 'b' };
      const withMetadata = { c: 'd' };
      const sendEvent = service.sendEvent = spy();
      const addMetadata = service.addMetadata = spy(() => withMetadata);
      const result = { e: 'f' };
      const override = spy(() => result);

      service.sendOrderEvent(event, override);

      expect(sendEvent).to.be.calledWith('sendOrderEvent', result);
      expect(override).to.be.calledWithExactly(event, withMetadata);
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

    it('should override event with the override function if it exists', () => {
      const id = '1234';
      const collection = 'myCollection';
      const title = 'top hat';
      const price = 132.40;
      const allMeta = { a: 'b' };
      const withMetadata = { c: 'd' };
      const record = { allMeta, collection };
      const sendEvent = service.sendEvent = spy();
      const addMetadata = service.addMetadata = spy(() => withMetadata);
      const result = { e: 'f' };
      const override = spy(() => result);
      service.transform = spy(() => ({ data: { id, title, price } }));

      service.sendViewProductEvent({ allMeta, collection }, override);

      expect(sendEvent).to.be.calledWith('sendViewProductEvent', result);
      expect(override).to.be.calledWithExactly({ allMeta, collection }, withMetadata);
    });
  });

  describe('sendMoreRefinementsEvent()', () => {
    it('should send event with metadata', () => {
      const id = 'colour';
      const withMetadata = { c: 'd' };
      const sendEvent = service.sendEvent = spy();
      const addMetadata = service.addMetadata = spy(() => withMetadata);

      service.sendMoreRefinementsEvent(id);

      expect(addMetadata).to.be.calledWith({ moreRefinements: { id } });

      expect(sendEvent).to.be.calledWith('sendMoreRefinementsEvent', withMetadata);
    });

    it('should override event with the override function if it exists', () => {
      const id = 'colour';
      const withMetadata = { c: 'd' };
      const sendEvent = service.sendEvent = spy();
      const addMetadata = service.addMetadata = spy(() => withMetadata);
      const result = { e: 'f' };
      const override = spy(() => result);

      service.sendMoreRefinementsEvent(id, override);

      expect(sendEvent).to.be.calledWith('sendMoreRefinementsEvent', result);
      expect(override).to.be.calledWithExactly(id, withMetadata);
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
