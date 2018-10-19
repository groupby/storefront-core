import { Events, Routes, Selectors } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import CoreSelectors from '../../../src/core/selectors';
import { BaseService, CORE } from '../../../src/core/service';
import * as UrlBeautifier from '../../../src/core/url-beautifier';
import * as CoreUtils from '../../../src/core/utils';
import Service, { STOREFRONT_APP_ID } from '../../../src/services/url';
import Utils from '../../../src/services/urlUtils';
import suite from './_suite';

suite('URL Service', ({ expect, spy, stub, itShouldBeCore, itShouldExtendBaseService }) => {
  const routes = { a: 'b' };
  const routesWithBase = { a: '/base/b' };
  const beautifier = { refinementMapping: [], queryToken: 'q' };
  let service: Service;
  let urlBeautifier;
  let addEventListener;
  let win;
  let generateRoutes;

  beforeEach(() => {
    addEventListener = spy();
    win = { addEventListener };
    stub(CoreUtils, 'WINDOW').returns(win);
    generateRoutes = stub(Service.prototype, 'generateRoutes').returns(routesWithBase);
    urlBeautifier = stub(UrlBeautifier, 'default');
    service = new Service(<any>{}, <any>{ routes, beautifier });
  });

  itShouldBeCore(Service);

  describe('constructor()', () => {
    itShouldExtendBaseService(() => service);

    it('should create a new URL Beautifier', () => {
      expect(urlBeautifier).to.be.calledWith(routesWithBase, beautifier);
    });

    it('should create a new user-defined beautifier', () => {
      const app: any = { a: 'b' };
      const userBeautifier = { c: 'd' };
      const beautifierFactory = spy(() => userBeautifier);
      service = new Service(app, <any>{ routes, beautifier: beautifierFactory });

      expect(beautifierFactory).to.be.calledWith(app, routesWithBase);
      expect(service.beautifier).to.eq(userBeautifier);
    });

    it('should add popstate listener', () => {
      expect(addEventListener).to.be.calledWith('popstate', service.rewind);
    });
  });

  describe('init()', () => {
    it('should listenForHistoryChange and handleUrl', () => {
      const listenForHistoryChange = service.listenForHistoryChange = spy();
      const handleUrl = service.handleUrl = spy();

      service.init();

      expect(listenForHistoryChange).to.be.calledOnce;
      expect(handleUrl).to.be.calledOnce;
    });
  });

  describe('handleUrl()', () => {
    it('should call handleCurrentLocation', () => {
      const handleCurrentLocation = service.handleCurrentLocation = spy();

      service.handleUrl();

      expect(handleCurrentLocation).to.be.calledOnce;
    });

    it('should warn on error', () => {
      const href = 'https://example.com/route';
      const route = '/route';
      const request = 'request';
      const parse = stub().throws();
      const warn = spy();
      win.location = { href };
      service.beautifier = <any>{ parse };
      service['app'] = <any>{ log: { warn } };

      service.handleUrl();

      expect(parse).to.be.calledWith(href);
      expect(warn).to.be.called;
    });

    it('should warn on error asynchronously', (done) => {
      const href = 'https://example.com/route';
      const route = '/route';
      const request = 'request';
      const parse = stub().rejects();
      win.location = { href };
      service.beautifier = <any>{ parse };
      service['app'] = <any>{
        log: {
          warn: () => {
            done();
          },
        },
      };

      service.handleUrl();

      expect(parse).to.be.calledWith(href);
    });
  });

  describe('handleCurrentLocation()', () => {
    it('should parse response and call triggerRequest', () => {
      const href = 'https://example.com/route';
      const route = '/route';
      const request = 'request';
      const triggerRequest = service.triggerRequest = spy();
      const parse = stub().resolves({ route, request });
      win.location = { href };
      service.beautifier = <any>{ parse };

      const p = service.handleCurrentLocation();

      expect(parse).to.be.calledWith(href);
      return p.then((response) => {
        expect(triggerRequest).to.be.calledWith(route, request);
      });
    });
  });

  describe('triggerRequest()', () => {
    describe('SEARCH', () => {
      it('should build request and fetch', () => {
        const FETCH_PRODUCTS_WHEN_HYDRATED = 'FETCH_PRODUCTS_WHEN_HYDRATED';
        const state = { a: 'b' };
        const urlState: any = { e: 'f' };
        const newState = { c: 'd' };
        const request = { e: 'f' };
        const dispatch = spy();
        const fetchProductsWhenHydrated = spy(() => FETCH_PRODUCTS_WHEN_HYDRATED);
        stub(Utils, 'searchStateToRequest').withArgs(urlState, state).returns(request);
        service['app'] = <any>{
          flux: {
            store: { dispatch, getState: () => state },
            actions: { fetchProductsWhenHydrated },
          },
        };

        service.triggerRequest(Routes.SEARCH, urlState);

        expect(fetchProductsWhenHydrated).to.be.calledWith({ request });
        expect(dispatch).to.be.calledWith(FETCH_PRODUCTS_WHEN_HYDRATED);
      });
    });

    describe('PAST_PURCHASE', () => {
      it('should build request and fetch', () => {
        const FETCH_PAST_PURCHASE_PRODUCTS = 'FETCH_PAST_PURCHASE_PRODUCTS';
        const state = { a: 'b' };
        const urlState: any = { e: 'f' };
        const newState = { c: 'd' };
        const request = { e: 'f' };
        const dispatch = spy();
        const fetchPastPurchaseProducts = spy(() => FETCH_PAST_PURCHASE_PRODUCTS);
        stub(Utils, 'pastPurchaseStateToRequest').withArgs(urlState, state).returns(request);
        service['app'] = <any>{
          flux: {
            store: { dispatch, getState: () => state },
            actions: { fetchPastPurchaseProducts },
          },
        };

        service.triggerRequest(Routes.PAST_PURCHASE, urlState);

        expect(fetchPastPurchaseProducts).to.be.calledWith({ request });
        expect(dispatch).to.be.calledWith(FETCH_PAST_PURCHASE_PRODUCTS);
      });
    });

    describe('DETAILS', () => {
      it('should build request and fetch', () => {
        const FETCH_PRODUCT_DETAILS = 'FETCH_PRODUCT_DETAILS';
        const state = { a: 'b' };
        const urlState: any = { data: { id: 1 } };
        const newState = { c: 'd' };
        const dispatch = spy();
        const fetchProductDetails = spy(() => FETCH_PRODUCT_DETAILS);
        service['app'] = <any>{
          flux: {
            store: { dispatch, getState: () => state },
            actions: { fetchProductDetails },
          },
        };

        service.triggerRequest(Routes.DETAILS, urlState);

        expect(fetchProductDetails).to.be.calledWith({ id: urlState.data.id });
        expect(dispatch).to.be.calledWith(FETCH_PRODUCT_DETAILS);
      });
    });
  });

  describe('generateRoutes()', () => {
    beforeEach(() => generateRoutes.restore());

    it('should generate routes with base path', () => {
      const basePath = '/base';
      const getBasePath = stub(Utils, 'getBasePath').returns(basePath);
      service['opts'] = <any>{ routes: { a: '/b', c: '/d', e: '/f' } };

      expect(service.generateRoutes()).to.eql({
        a: `${basePath}/b`,
        c: `${basePath}/d`,
        e: `${basePath}/f`,
      });
    });
  });

  describe('listenForHistoryChange()', () => {
    it('should listen for HISTORY_SAVE', () => {
      const on = spy();
      service['app'] = <any>{ flux: { on } };

      service.listenForHistoryChange();

      expect(on).to.be.calledWith(Events.HISTORY_SAVE, service.updateHistory);
    });

    it('should listen for HISTORY_REPLACE', () => {
      const on = spy();
      service['app'] = <any>{ flux: { on } };

      service.listenForHistoryChange();

      expect(on).to.be.calledWith(Events.HISTORY_REPLACE, service.buildUrlAndReplaceHistory);
    });
  });

  describe('updateHistory()', () => {
    it('should redirect using custom urlHandler', () => {
      const url = '/some/url';
      const route = 'search';
      const urlHandler = spy();
      service.beautifier = <any>{ build: () => url };
      service['opts'] = { urlHandler };
      service.urlState = <any>{ [route]: () => null };

      service.updateHistory(<any>{ state: <any>{}, route });

      expect(urlHandler).to.be.calledWithExactly(url);
    });

    it('should redirect to another location using opts redirect as a function', () => {
      const url = '/some/url';
      const externalUrl = 'whatever.com';
      const route = 'search';
      const assign = spy();
      const build = spy(() => url);
      const data = { e: 'f' };
      const newState = { g: 'h' };
      win.location = { assign };
      service.beautifier = <any>{ build };
      service['opts'] = { redirects: () => externalUrl };
      service.urlState = <any>{
        [route]: () => newState,
      };

      service.updateHistory(<any>{ state: <any>{ data }, route });

      expect(build).to.be.calledWith(route, newState);
      expect(assign).to.be.calledWithExactly(externalUrl);
    });

    it('should redirect to another location', () => {
      const url = '/some/url';
      const externalUrl = 'whatever.com';
      const route = 'search';
      const assign = spy();
      const build = spy(() => url);
      const data = { e: 'f' };
      const newState = { g: 'h' };
      win.location = { assign };
      service.beautifier = <any>{ build };
      service['opts'] = { redirects: { [url]: externalUrl } };
      service.urlState = <any>{
        [route]: () => newState,
      };

      service.updateHistory(<any>{ state: <any>{ data }, route });

      expect(build).to.be.calledWith(route, newState);
      expect(assign).to.be.calledWithExactly(externalUrl);
    });

    it('should create urls search state from state', () => {
      const page = 48;
      const pageSize = 5;
      const url = '/some/url';
      const query = 'air jordans';
      const route = 'search';
      const refinements = [
        { navigationName: 'a', value: 'b', type: 'Value' },
        { navigationName: 'price', low: 0, high: 10, type: 'Range' },
      ];
      const convertedRefinements = [{ field: 'a', value: 'b' }, { field: 'price', low: 0, high: 10 }];
      const sort = ['c', 'd'];
      const collection = 'All';
      const pushState = spy(() => win.location = { href: 'something else' });
      const build = spy(() => url);
      const data = { e: 'f' };
      const state = { data };
      const fluxState = { a: 'b' };
      const filterState = service.filterState = spy(() => state);
      const emit = spy();
      const handleUrl = service.handleUrl = spy();
      win.history = { pushState };
      win.location = { href: 'something different' };
      stub(Selectors, 'query').returns(query);
      stub(Selectors, 'pageSize').returns(pageSize);
      stub(Selectors, 'page').returns(page);
      stub(Selectors, 'selectedRefinements').returns(refinements);
      stub(Selectors, 'sort').returns(sort);
      stub(Selectors, 'collection').returns(collection);
      service.beautifier = <any>{ build };
      service['app'].flux = <any>{ emit, store: { getState: () => fluxState } };
      service['opts'] = { redirects: {} };

      service.updateHistory(<any>{ state, route });

      expect(build).to.be.calledWith(route, {
        query,
        page,
        pageSize,
        refinements: convertedRefinements,
        sort,
        collection,
      });
      expect(filterState).to.be.calledWithExactly(fluxState);
      expect(pushState).to.be.calledWithExactly({ url, state: { data }, app: STOREFRONT_APP_ID }, '', url);
      expect(emit).to.be.calledWithExactly(Events.URL_UPDATED, url);
      expect(handleUrl).to.be.calledOnce;
    });

    it('should handle errors thrown by pushState', () => {
      const err = new Error('Whoops, something went wrong!');
      const pushState = stub().throws(err);
      const warn = spy();
      win.history = { pushState };
      stub(service, 'filterState');
      service['app'] = <any>{ log: { warn } };
      service.beautifier = <any>{ build: () => '/foo' };
      service['opts'] = <any>{ redirects: {} };
      service.urlState = <any>{ search: () => '' };

      service.updateHistory(<any>{ state: {}, route: 'search' });

      expect(warn).to.be.called;
    });
  });

  describe('buildUrlAndReplaceHistory()', () => {
    it('should build url and call replaceHistory', () => {
      const url = 'www.example.com';
      const search = spy(() => 'hey');
      const build = spy(() => url);
      const obj = <any>{ state: { a: 'b' }, route: 'search' };
      const replaceHistory = (service.replaceHistory = spy());
      service.beautifier = <any>{ build };
      service.urlState = <any>{
        search,
      };

      service.buildUrlAndReplaceHistory(obj);

      expect(build).to.be.calledWithExactly('search', search());
      expect(replaceHistory).to.be.calledWithExactly(url);
    });
  });

  describe('replaceHistory()', () => {
    it('should replace the current state in history', () => {
      const url = 'http://example.com';
      const title = 'my page';
      const state = { a: 'b' };
      const replaceState = spy(() => win.location = { href: 'something else' });
      const getState = spy(() => state);
      const filterState = (service.filterState = spy((value) => value));
      const emit = spy();
      service['app'] = <any>{ flux: { store: { getState }, emit } };
      win.history = { replaceState };
      win.location = { href: 'something different' };
      win.document = { title };

      service.replaceHistory(url);

      expect(filterState).to.be.calledWithExactly(state);
      expect(replaceState).to.be.calledWith(
        {
          url,
          state,
          app: STOREFRONT_APP_ID,
        },
        title,
        url
      );
      expect(emit).to.be.calledWithExactly(Events.URL_UPDATED, url);
    });

    it('should handle errors thrown by replaceState', () => {
      const err = new Error('Whoops, something went wrong!');
      const replaceState = stub().throws(err);
      const store = { getState: spy() };
      const warn = spy();
      win.document = { title: 'Foo' };
      win.history = { replaceState };
      stub(service, 'filterState');
      service['app'] = <any>{
        log: { warn },
        flux: { store },
      };

      service.replaceHistory('/foo');

      expect(warn).to.be.called;
    });
  });

  describe('emitUrlUpdated()', () => {
    it('should emit if given oldUrl is different from newUrl', () => {
      const payload = '/search?q=hi';
      const emit = spy();
      service['app'] = <any>{ flux: { emit } };

      service.emitUrlUpdated('www.one.com/search?q=hi', 'www.two.com/search?q=hi', payload);

      expect(emit).to.be.calledWithExactly(Events.URL_UPDATED, payload);
    });

    it('should do nothing if oldUrl and newUrl are equal', () => {
      const payload = '/search?q=hi';
      const emit = spy();
      service['app'] = <any>{ flux: { emit } };

      service.emitUrlUpdated('www.one.com/search?q=hi', 'www.one.com/search?q=hi', payload);

      expect(emit).to.be.not.be.called;
    });
  });

  describe('filterState()', () => {
    it('should filter config from state and remove products when history length is 0', () => {
      const data = { a: 'b', past: [{ a: 'b' }], present: { products: [1,2,3,4,5] } };
      const config = { history: { length: 0 } };
      const session = { a: 'b', c: 'd' };
      const sessionWithConfig = { ...session, config };
      const otherData = {
        e: 'f',
        j: { h: 1 },
        o: [2, 3, 4],
        n: { i: 'r', k: {} },
      };
      const state: any = { ...otherData, session: sessionWithConfig, data };
      Object.freeze(state);
      Object.freeze(session);
      Object.freeze(sessionWithConfig);
      service['app'] = <any>{ config };

      const stateWithoutConfig = service.filterState(state);

      expect(stateWithoutConfig).to.eql({
        ...otherData,
        session,
        data: { ...data, past: [], present: { products: [] } }
      });
    });

    it('should filter config from state without modifying state', () => {
      const config = { history: { length: 5 } };
      const session = { a: 'b', c: 'd' };
      const sessionWithConfig = { ...session, config };
      const otherData = {
        e: 'f',
        j: {
          h: 1,
        },
        o: [2, 3, 4],
        n: {
          i: 'r',
          k: {},
        },
        data: {
          past: [{ a: 'b' }],
          present: {
            products: [{ c: 'd' }],
          },
        },
      };
      const state: any = { ...otherData, session: sessionWithConfig };
      Object.freeze(state);
      Object.freeze(session);
      Object.freeze(sessionWithConfig);
      service['app'] = <any>{ config };

      const stateWithoutConfig = service.filterState(state);

      expect(stateWithoutConfig).to.eql({
        ...otherData,
        session,
        data: {
          ...otherData.data,
          past: [],
        },
      });
    });
  });

  describe('rewind()', () => {
    it('should refresh state from history', () => {
      const url = 'http://example.com';
      const state = { a: 'b' };
      const emit = spy();
      const config = { history: { length: 5 } };
      const refreshState = (service.refreshState = spy());
      win.location = { href: url };
      service['app'] = <any>{ config, flux: { emit } };

      service.rewind(<any>{ state: { state, app: STOREFRONT_APP_ID } });

      expect(refreshState).to.be.calledWith(state);
      expect(emit).to.be.calledWith(Events.URL_UPDATED, url);
    });

    it('should refresh state from history and fetchProductsWithoutHistory when history length is 0', () => {
      const FETCH = 'FETCH';
      const url = 'http://example.com';
      const state = { a: 'b' };
      const emit = spy();
      const config = { history: { length: 0 } };
      const refreshState = (service.refreshState = spy());
      const dispatch = spy();
      const fetchProductsWithoutHistory = stub().returns(FETCH);
      win.location = { href: url };
      service['app'] = <any>{ config, flux: { emit, store: { dispatch }, actions: { fetchProductsWithoutHistory } } };

      service.rewind(<any>{ state: { state, app: STOREFRONT_APP_ID } });

      expect(refreshState).to.be.calledWith(state);
      expect(emit).to.be.calledWith(Events.URL_UPDATED, url);
      expect(dispatch).to.be.calledWithExactly(FETCH);
    });

    it('should not refresh state from history if no stored state', () => {
      service.refreshState = (): any => expect.fail();

      service.rewind(<any>{ state: {} });
    });

    it('should not refresh state from history if not storefront state', () => {
      service.refreshState = (): any => expect.fail();

      service.rewind(<any>{ state: { state: {} } });
    });
  });

  describe('refreshState()', () => {
    it('should dispatch refreshState action', () => {
      const refreshStateAction = { a: 'b' };
      const state = { c: 'd' };
      const dispatch = spy();
      const refreshState = spy(() => refreshStateAction);
      service['app'] = <any>{ flux: { store: { dispatch }, actions: { refreshState } } };

      service.refreshState(state);

      expect(refreshState).to.be.calledWith(state);
      expect(dispatch).to.be.calledWith(refreshStateAction);
    });
  });
});
