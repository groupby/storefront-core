import * as riot from 'riot';
import { core, Configuration, System } from '../../src/core';
import Tag from '../../src/tag';
import { expect, sinon } from '../_suite';

describe('System', () => {
  afterEach(() => sinon.restore());

  describe('constructor()', () => {
    it('should set app', () => {
      const app: any = {};
      const system = new System(app);

      expect(system.app).to.eq(app);
    });
  });

  describe('bootstrap()', () => {
    it('should transform config', () => {
      const app: any = {};
      const config: any = {};
      const finalConfig = {};
      const system = new System(app);
      const transform = sinon.stub(Configuration.Transformer, 'transform').returns(finalConfig);

      system.bootstrap({}, config);

      expect(app.config).to.eq(finalConfig);
      expect(transform.calledWith(config)).to.be.true;
    });

    it('should build services', () => {
      const app: any = {};
      const services = {};
      const builtServices = {};
      const system = new System(app);
      const extractUserServices = sinon.stub(System, 'extractUserServices');
      const buildServices = sinon.stub(System, 'buildServices').returns(builtServices);
      sinon.stub(Configuration.Transformer, 'transform').returns({});

      system.bootstrap(services, <any>{});

      expect(app.services).to.eq(builtServices);
      expect(extractUserServices.calledWith({})).to.be.true;
      expect(buildServices.calledWith(app, services, {})).to.be.true;
    });

    it('should allow overriding services', () => {
      const app: any = {};
      const services: any = { a: 'b', c: 'd' };
      const servicesConfig = { c: 'd1', e: 'f' };
      const system = new System(app);
      const extractUserServices = sinon.stub(System, 'extractUserServices').returns(servicesConfig);
      const buildServices = sinon.stub(System, 'buildServices');
      sinon.stub(Configuration.Transformer, 'transform').returns({ services: servicesConfig });

      system.bootstrap(services, <any>{});

      expect(extractUserServices.calledWith(servicesConfig)).to.be.true;
      expect(buildServices.calledWith(app, { a: 'b', c: 'd1', e: 'f' }, servicesConfig)).to.be.true;
    });

    it('should allow user-defined services', () => {
      const service = {};
      const mockService = sinon.spy(() => service);
      const app: any = {};
      const system = new System(app);
      class MockService { }

      system.bootstrap({}, <any>{ services: { mockService } });

      expect(app.services.mockService).to.eq(service);
      expect(mockService.calledWith(app, {})).to.be.true;
    });

    it('should call user bootstrap function it provided', () => {
      const bootstrap = sinon.spy();
      const app: any = {};
      const system = new System(app);

      system.bootstrap({}, <any>{ bootstrap });

      expect(bootstrap.calledWith(app)).to.be.true;
    });
  });

  describe('initServices()', () => {
    it('should call init() on each service', () => {
      const init1 = sinon.spy();
      const init2 = sinon.spy();
      const services = { s1: { init: init1 }, s2: { init: init2 } };
      const system = new System(<any>{ services, log: { debug: () => null } });

      system.initServices();

      expect(init1.calledWith(services)).to.be.true;
      expect(init2.calledWith(services)).to.be.true;
    });
  });

  describe('initMixin()', () => {
    it('should generate mixin', () => {
      const app: any = { services: {}, config: {} };
      const mixin = sinon.stub(Tag, 'mixin');
      const system = new System(app);
      sinon.stub(riot, 'mixin');

      system.initMixin();

      expect(mixin.calledWith(app)).to.be.true;
    });

    it('should setup global mixin', () => {
      const coreMixin = { a: 'b' };
      const system = new System(<any>{ config: { globalMixin: true } });
      const mixin = sinon.stub(riot, 'mixin');
      sinon.stub(Tag, 'mixin').returns(coreMixin);

      system.initMixin();

      expect(mixin.calledWith(coreMixin)).to.be.true;
    });

    it('should setup storefront mixin', () => {
      const coreMixin = { a: 'b' };
      const system = new System(<any>{ config: {} });
      const mixin = sinon.stub(riot, 'mixin');
      sinon.stub(Tag, 'mixin').returns(coreMixin);

      system.initMixin();

      expect(mixin.calledWith('storefront', coreMixin)).to.be.true;
      expect(mixin.calledWith('sf', coreMixin)).to.be.true;
    });
  });

  describe('static', () => {
    describe('buildServices()', () => {
      it('should construct services', () => {
        const app: any = {};
        const constructor = sinon.spy();
        class MockService {
          constructor(...args: any[]) { constructor(...args); }
        }

        const services = System.buildServices(app, <any>{ mockService: MockService }, {});

        expect(services['mockService']).to.be.an.instanceof(MockService);
        expect(constructor.calledWith(app, {})).to.be.true;
      });

      it('should remove disabled services', () => {
        const app: any = {};
        const constructor = sinon.spy();
        class MockService { constructor(...args: any[]) { constructor(...args); } }

        const services = System.buildServices(app, <any>{ mockService: MockService }, { mockService: false });

        expect(services).to.eql({});
        expect(constructor.called).to.be.false;
      });

      it('should not disable core services', () => {
        const app: any = {};
        @core
        class MockService { }

        const services = System.buildServices(app, <any>{ mockService: MockService }, { mockService: false });

        expect(services['mockService']).to.be.an.instanceof(MockService);
      });

      it('should allow configuration of services', () => {
        const mockService = { a: 'b' };
        const constructor = sinon.spy();
        const app: any = {};
        class MockService { constructor(...args: any[]) { constructor(...args); } }

        System.buildServices(app, <any>{ mockService: MockService }, { mockService });

        expect(constructor.calledWith(app, mockService)).to.be.true;
      });
    });

    describe('extractUserServices()', () => {
      it('should extract functions', () => {
        const userService = () => null;
        const services = { a: 'b', c: 4, e: true, userService };

        const userServices = System.extractUserServices(services);

        expect(userServices).to.eql({ userService });
      });
    });
  });
});
