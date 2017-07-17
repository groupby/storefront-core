import * as fluxPkg from '@storefront/flux-capacitor';
import * as riot from 'riot';
import Configuration from '../../../src/core/configuration';
import { core } from '../../../src/core/service';
import System from '../../../src/core/system';
import Tag from '../../../src/core/tag';
import * as utils from '../../../src/core/utils';
import Globals from '../../../src/globals';
import suite from '../_suite';

const CONFIG: any = { y: 'z' };

suite('System', ({ expect, spy, stub }) => {
  describe('constructor()', () => {
    it('should set app', () => {
      const app: any = { a: 'b' };
      const system = new System(app);

      expect(system.app).to.eq(app);
    });
  });

  describe('bootstrap()', () => {
    it('should transform config', () => {
      const app: any = { a: 'b' };
      const finalConfig = { options: {} };
      const system = new System(app);
      const transform = stub(Configuration.Transformer, 'transform').returns(finalConfig);
      stub(fluxPkg, 'default');

      system.bootstrap({}, CONFIG);

      expect(app.config).to.eq(finalConfig);
      expect(transform).to.be.calledWith(CONFIG);
    });

    it('should set riot instance', () => {
      const app: any = { a: 'b' };
      const riot = { e: 'f' };
      const system = new System(app);
      stub(Configuration.Transformer, 'transform').returns({ options: { riot } });
      stub(fluxPkg, 'default');

      system.bootstrap({}, CONFIG);

      expect(app.riot).to.eq(riot);
    });

    it('should fallback to default riot instance', () => {
      const app: any = { a: 'b' };
      const riot = { e: 'f' };
      const system = new System(app);
      const transform = stub(Configuration.Transformer, 'transform').returns({ options: {} });
      stub(Globals, 'getRiot').returns(riot);
      stub(fluxPkg, 'default');

      system.bootstrap({}, CONFIG);

      expect(app.riot).to.eq(riot);
    });

    it('should initialize FluxCapacitor', () => {
      const app: any = { a: 'b' };
      const config: any = { options: {} };
      const instance: any = { e: 'f' };
      const system = new System(app);
      const fluxCapacitor = stub(fluxPkg, 'default').returns(instance);
      stub(Configuration.Transformer, 'transform').returns(config);

      system.bootstrap({}, CONFIG);

      expect(app.flux).to.eq(instance);
      expect(fluxCapacitor).to.be.calledWith(config);
    });

    it('should build services', () => {
      const app: any = { a: 'b' };
      const services: any = { c: 'd' };
      const builtServices = { e: 'f' };
      const system = new System(app);
      const extractUserServices = stub(System, 'extractUserServices');
      const buildServices = stub(System, 'buildServices').returns(builtServices);
      stub(Configuration.Transformer, 'transform').returns({ options: {} });
      stub(fluxPkg, 'default');

      system.bootstrap(services, CONFIG);

      expect(app.services).to.eq(builtServices);
      expect(extractUserServices).to.be.calledWith({});
      expect(buildServices).to.be.calledWith(app, services, {});
    });

    it('should allow overriding services', () => {
      const app: any = { b: 'bd' };
      const services: any = { a: 'b', c: 'd' };
      const servicesConfig = { c: 'd1', e: 'f' };
      const system = new System(app);
      const extractUserServices = stub(System, 'extractUserServices').returns(servicesConfig);
      const buildServices = stub(System, 'buildServices');
      stub(Configuration.Transformer, 'transform').returns({ services: servicesConfig, options: {} });
      stub(fluxPkg, 'default');

      system.bootstrap(services, CONFIG);

      expect(extractUserServices).to.be.calledWith(servicesConfig);
      expect(buildServices).to.be.calledWith(app, { a: 'b', c: 'd1', e: 'f' }, servicesConfig);
    });

    it('should allow user-defined services', () => {
      const app: any = { a: 'b' };
      const service = { c: 'd' };
      const mockService = spy(() => service);
      const system = new System(app);
      stub(Configuration.Transformer, 'transform').returns({ services: { mockService }, options: {} });
      stub(fluxPkg, 'default');
      class MockService { }

      system.bootstrap({}, CONFIG);

      expect(app.services.mockService).to.eq(service);
      expect(mockService).to.be.calledWith(app, {});
    });

    it('should call user bootstrap function if provided', () => {
      const bootstrap = spy();
      const app: any = {};
      const system = new System(app);
      stub(Configuration.Transformer, 'transform').returns({ bootstrap, options: {} });
      stub(fluxPkg, 'default');

      system.bootstrap({}, CONFIG);

      expect(bootstrap.calledWith(app)).to.be.true;
    });
  });

  describe('initServices()', () => {
    it('should call init() on each service', () => {
      const init1 = spy();
      const init2 = spy();
      const services = { s1: { init: init1 }, s2: { init: init2 } };
      const system = new System(<any>{ services, log: { debug: () => null } });

      system.initServices();

      expect(init1).to.be.calledWith(services);
      expect(init2).to.be.calledWith(services);
    });
  });

  describe('initMixin()', () => {
    it('should setup named mixin', () => {
      const tagMixin = { a: 'b' };
      const mixin = spy();
      const mixinCore = stub(Tag, 'mixin').returns(tagMixin);
      const app: any = {
        riot: { mixin },
        services: {}, config: { options: {} }
      };
      const system = new System(app);

      system.initMixin();

      expect(mixinCore).to.be.calledWith(app);
      expect(mixin).to.be.calledWith('storefront', tagMixin);
      expect(mixin).to.be.calledWith('sf', tagMixin);
    });

    it('should setup global mixin', () => {
      const tagMixin = { a: 'b' };
      const mixin = spy();
      const mixinCore = stub(Tag, 'mixin').returns(tagMixin);
      const app: any = {
        riot: { mixin },
        services: {}, config: { options: { globalMixin: true } }
      };
      const system = new System(app);

      system.initMixin();

      expect(mixinCore).to.be.calledWith(app);
      expect(mixin).to.be.calledWith(tagMixin);
    });
  });

  describe('registerTags()', () => {
    it('should call tag registration functions', () => {
      const register1 = spy();
      const register2 = spy();
      const register = () => null;
      const system = new System(<any>{ register });
      stub(Globals, 'getTags').returns([register1, register2]);

      system.registerTags();

      expect(register1).to.be.calledWith(register);
      expect(register2).to.be.calledWith(register);
    });
  });

  describe('static', () => {
    describe('buildServices()', () => {
      it('should construct services', () => {
        const app: any = {};
        const constructor = spy();
        class MockService {
          constructor(...args: any[]) { constructor(...args); }
        }

        const services = System.buildServices(app, <any>{ mockService: MockService }, {});

        expect(services['mockService']).to.be.an.instanceof(MockService);
        expect(constructor).to.be.calledWith(app, {});
      });

      it('should remove disabled services', () => {
        const app: any = {};
        const constructor = spy();
        class MockService { constructor(...args: any[]) { constructor(...args); } }

        const services = System.buildServices(app, <any>{ mockService: MockService }, { mockService: false });

        expect(services).to.eql({});
        expect(constructor).to.not.be.called;
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
        const constructor = spy();
        const app: any = {};
        class MockService { constructor(...args: any[]) { constructor(...args); } }

        System.buildServices(app, <any>{ mockService: MockService }, { mockService });

        expect(constructor).to.be.calledWith(app, mockService);
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
