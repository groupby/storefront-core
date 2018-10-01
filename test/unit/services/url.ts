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

  describe('init()', () => {
    it('should refresh state from URL', () => {
      const href = 'http://my-url';
      const state = { a: 'b' };
      const obj = { route: 'search', request: { c: 'd' } };
      const newState = { e: 'f' };
      const getState = spy(() => state);
      const parse = spy(() => obj);
      const refreshState = (service.refreshState = spy());
      const merge = stub(Utils, 'mergeSearchState').returns(newState);
      win.location = { href };
      service.beautifier = <any>{ parse };
      service['app'] = <any>{ flux: { store: { subscribe: () => null, getState } } };

      service.init();

      expect(parse).to.be.calledWith(href);
      expect(refreshState).to.be.calledWith(newState);
      expect(merge).to.be.calledWithExactly(state, obj.request);
    });

    it('should augment history on state updated', () => {
      const obj = { route: 'pastpurchase', request: { c: 'd' } };
      const state = 'state';
      const getState = () => state;
      const unsubscribe = spy();
      const subscribe = spy(() => unsubscribe);
      const augmentHistory = (service.augmentHistory = spy());
      const merge = stub(Utils, 'mergePastPurchaseState').returns(null);
      win.location = {};
      service.refreshState = () => null;
      service.beautifier = <any>{ parse: () => obj };
      service['app'] = <any>{ flux: { store: { subscribe, getState } } };

      service.init();

      expect(subscribe).to.be.calledWith(
        sinon.match((cb) => {
          cb();

          expect(unsubscribe).to.be.called;
          return expect(augmentHistory).to.be.called;
        })
      );
      expect(merge).to.be.calledWithExactly(state, obj.request);
    });

    it('should just call augmentHistory if invalid route', () => {
      const obj = { route: 'asdfasdfasdf', request: { c: 'd' } };
      const augmentHistory = (service.augmentHistory = spy());
      win.location = {};
      service.refreshState = () => null;
      service.beautifier = <any>{ parse: () => obj };
      const subscribe = spy();
      service['app'] = <any>{ flux: { store: { subscribe } } };

      service.init();
      expect(augmentHistory).to.be.calledWithExactly(obj.route, obj.request);
      expect(subscribe).to.not.be.called;
    });

    it('should listen for any future change on failure', () => {
      const warn = spy();
      const listenForHistoryChange = (service.listenForHistoryChange = spy());
      win.location = { href: 'idk' };
      service.beautifier = <any>{
        parse: () => {
          throw 'Error';
        },
      };
      service['app'] = <any>{ log: { warn } };

      service.init();

      expect(warn).to.be.calledWith('unable to parse state from url');
      expect(listenForHistoryChange).to.be.called;
    });

    it('should accept a route', () => {
      const resultA = { route: 'ab', request: { c: 'd' } };
      const handleUrl = (service.handleUrl = spy());
      win.location = { href: 'http://does.not.matter.ca' };

      const parse = spy(() => resultA);
      service.beautifier = <any>{ parse };
      service.init();

      expect(handleUrl).to.be.calledWith(resultA.route, resultA.request);
    });

    it('should accept promise which resolves to a route', (done) => {
      const resultA = { route: 'ab', request: { c: 'd' } };
      const resultB = new Promise((resolve, reject) => {
        resolve(resultA);
        done();
      });
      const handleUrl = (service.handleUrl = spy());
      win.location = { href: 'http://does.not.matter.ca' };

      const parse = spy(() => resultB);
      service.beautifier = <any>{ parse };
      service.init();

      expect(handleUrl).to.be.calledWith(resultA.route, resultA.request);
    });

    it('should reject promise with a warning', (done) => {
      const resultB = new Promise((resolve, reject) => {
        reject();
        done();
      });
      const handleUrl = (service.handleUrl = spy());
      win.location = { href: 'http://does.not.matter.ca' };
      const warn = spy();
      service['app'] = <any>{ log: { warn } };

      const parse = spy(() => resultB);
      service.beautifier = <any>{ parse };
      service.init();

      expect(warn).to.be.calledWith('UrlService init promise failed');
    });
  });

  // TODO: these tests are now for `handleUrl`
  describe('handleUrlWithoutAugment()', () => {
    describe('SEARCH', () => {
      it('should merge and refresh state', () => {
        const FETCH_PRODUCTS_WHEN_HYDRATED = 'FETCH_PRODUCTS_WHEN_HYDRATED';
        const state = { a: 'b' };
        const request = '/req';
        const newState = { c: 'd' };
        const mergeSearchState = stub(Utils, 'mergeSearchState').returns(newState);
        const refreshState = (service.refreshState = spy());
        const dispatch = spy();
        service['app'] = <any>{
          flux: {
            store: { dispatch, getState: () => state },
            actions: { fetchProductsWhenHydrated: () => FETCH_PRODUCTS_WHEN_HYDRATED },
          },
        };

        service.handleUrlWithoutAugment(Routes.SEARCH, request);

        expect(mergeSearchState).to.be.calledWith(state, request);
        expect(refreshState).to.be.calledWith(newState);
        expect(dispatch).to.be.calledWith(FETCH_PRODUCTS_WHEN_HYDRATED);
      });
    });

    describe('PAST_PURCHASE', () => {
      it('should merge and refresh state', () => {
        const FETCH_PAST_PURCHASE_PRODUCTS = 'FETCH_PAST_PURCHASE_PRODUCTS';
        const state = { a: 'b' };
        const request = '/req';
        const newState = { c: 'd' };
        const mergePastPurchaseState = stub(Utils, 'mergePastPurchaseState').returns(newState);
        const refreshState = (service.refreshState = spy());
        const dispatch = spy();
        service['app'] = <any>{
          flux: {
            store: { dispatch, getState: () => state },
            actions: { fetchPastPurchaseProducts: () => FETCH_PAST_PURCHASE_PRODUCTS },
          },
        };

        service.handleUrlWithoutAugment(Routes.PAST_PURCHASE, request);

        expect(mergePastPurchaseState).to.be.calledWith(state, request);
        expect(refreshState).to.be.calledWith(newState);
        expect(dispatch).to.be.calledWith(FETCH_PAST_PURCHASE_PRODUCTS);
      });
    });

    describe('DETAILS', () => {
      it('should fetch product details', () => {
        const FETCH_PRODUCT_DETAILS = 'FETCH_PRODUCT_DETAILS';
        const request = { id: 'e' };
        const refreshState = (service.refreshState = spy());
        const dispatch = spy();
        service['app'] = <any>{
          flux: {
            store: { dispatch },
            actions: { fetchProductDetails: () => FETCH_PRODUCT_DETAILS },
          },
        };

        service.handleUrlWithoutAugment(Routes.DETAILS, request);

        expect(refreshState).not.to.be.called;
        expect(dispatch).to.be.calledWith(FETCH_PRODUCT_DETAILS);
      });
    });
  });

  describe('augmentHistory()', () => {
    it('should replace current window history', () => {
      const data = { a: 'b' };
      const title = 'Search Page';
      const replaceState = spy();
      win.document = { title };
      win.history = { replaceState };
      const replaceHistory = (service.replaceHistory = spy());
      win.location = { pathname: '/thing1', search: '?q=thing2', hash: '' };
      service['app'] = <any>{
        flux: {
          actions: { fetchProducts: () => null },
          store: { dispatch: () => null },
          once: () => null,
        },
      };

      service.augmentHistory('', {});

      expect(replaceHistory).to.be.calledOnce.and.calledWith('/thing1?q=thing2');
    });

    it('should update products and wait for after first state change', () => {
      const once = spy();
      const dispatch = spy();
      const fetchProductsAction = { a: 'b' };
      const replaceHistory = (service.replaceHistory = spy());
      const listenForHistoryChange = (service.listenForHistoryChange = spy());
      win.location = { pathname: '/thing1', search: '?q=thing2', hash: '' };
      service['app'] = <any>{
        flux: {
          actions: { fetchProducts: () => fetchProductsAction },
          store: { getState: () => ({}), dispatch },
          once,
        },
      };

      service.augmentHistory('', {});

      expect(once).to.be.calledWith(
        Events.HISTORY_SAVE,
        sinon.match((cb) => {
          cb();

          expect(replaceHistory).to.be.calledTwice.and.calledWith('/thing1?q=thing2');
          return expect(listenForHistoryChange).to.be.called;
        })
      );
    });

    it('should use hash when provided in the url', () => {
      const replaceHistory = (service.replaceHistory = spy());
      win.location = { pathname: '/thing1', search: '?q=thing2', hash: '#thing3' };
      service['app'] = <any>{
        flux: {
          actions: { fetchProducts: () => null },
          store: { dispatch: () => null },
          once: () => null,
        },
      };

      service.augmentHistory('', {});

      expect(replaceHistory).to.be.calledWith('/thing1?q=thing2#thing3');
    });

    it('should request products', () => {
      const action = { a: 1 };
      const dispatch = spy();
      const fetchProductsWhenHydrated = spy(() => action);
      service.replaceHistory = spy();
      win.location = { pathname: '/thing1', search: '?q=thing2' };
      service['app'] = <any>{
        flux: {
          actions: { fetchProductsWhenHydrated },
          store: { getState: () => ({}), dispatch },
          once: () => null,
        },
      };

      service.augmentHistory('search', {});

      expect(fetchProductsWhenHydrated).to.be.called;
      expect(dispatch).to.be.calledWith(action);
    });

    it('should request product details', () => {
      const request = { id: 20 };
      const dispatch = spy();
      const fetchProductDetails = stub();
      service.replaceHistory = spy();
      win.location = { pathname: '/thing1', search: '?q=thing2' };
      service['app'] = <any>{
        flux: {
          actions: { fetchProductDetails },
          store: { getState: () => ({}), dispatch },
          once: () => null,
        },
      };

      service.augmentHistory('details', request);

      expect(fetchProductDetails).to.be.calledWith(request.id);
      expect(dispatch).to.be.calledWith(fetchProductDetails());
    });

    it('should request past purchases', () => {
      const request = { id: 20 };
      const dispatch = spy();
      const fetchPastPurchaseProducts = stub();
      service.replaceHistory = spy();
      win.location = { pathname: '/thing1', search: '?q=thing2' };
      service['app'] = <any>{
        flux: {
          actions: { fetchPastPurchaseProducts },
          store: { getState: () => ({}), dispatch },
          once: () => null,
        },
      };

      service.augmentHistory('pastpurchase', request);

      expect(fetchPastPurchaseProducts).to.be.calledWithExactly();
      expect(dispatch).to.be.calledWith(fetchPastPurchaseProducts());
    });
  });

  describe('handleUrlWithoutListeners()', () => {
    it('should call handleUrlWithoutAugment()', () => {
      const href = 'https://example.com/route';
      const route = '/route';
      const request = 'request';
      const handleUrlWithoutAugment = (service.handleUrlWithoutAugment = spy());
      const parse = spy(() => ({ route, request }));
      win.location = { href };
      service.beautifier = <any>{ parse };

      service.handleUrlWithoutListeners();

      expect(parse).to.be.calledWith(href);
      expect(handleUrlWithoutAugment).to.be.calledWith(route, request);
    });

    it('should call handleUrlWithoutAugment() asynchronously', (done) => {
      const href = 'https://example.com/route';
      const route = '/route';
      const request = 'request';
      const handleUrlWithoutAugment = (service.handleUrlWithoutAugment = spy(() => {
        expect(handleUrlWithoutAugment).to.be.calledWith(route, request);
        done();
      }));
      const parse = stub().resolves({ route, request });
      win.location = { href };
      service.beautifier = <any>{ parse };

      service.handleUrlWithoutListeners();

      expect(parse).to.be.calledWith(href);
    });

    it('should warn on error', () => {
      const href = 'https://example.com/route';
      const route = '/route';
      const request = 'request';
      const handleUrlWithoutAugment = (service.handleUrlWithoutAugment = spy());
      const parse = stub().throws();
      const warn = spy();
      win.location = { href };
      service.beautifier = <any>{ parse };
      service['app'] = <any>{ log: { warn } };

      service.handleUrlWithoutListeners();

      expect(parse).to.be.calledWith(href);
      expect(warn).to.be.called;
      expect(handleUrlWithoutAugment).not.to.be.called;
    });

    it('should warn on error asynchronously', (done) => {
      const href = 'https://example.com/route';
      const route = '/route';
      const request = 'request';
      const handleUrlWithoutAugment = (service.handleUrlWithoutAugment = spy());
      const parse = stub().rejects();
      win.location = { href };
      service.beautifier = <any>{ parse };
      service['app'] = <any>{
        log: {
          warn: () => {
            expect(handleUrlWithoutAugment).not.to.be.called;
            done();
          },
        },
      };

      service.handleUrlWithoutListeners();

      expect(parse).to.be.calledWith(href);
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
      const replaceState = spy();
      const getState = spy(() => state);
      const filterState = (service.filterState = spy((value) => value));
      service['app'] = <any>{ flux: { store: { getState } } };
      win.history = { replaceState };
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

  describe('filterState()', () => {
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
      });
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
      const pushState = spy();
      const build = spy(() => url);
      const data = { e: 'f' };
      const state = { data };
      const filterState = (service.filterState = spy((value) => value));
      win.history = { pushState };
      stub(Selectors, 'query').returns(query);
      stub(Selectors, 'pageSize').returns(pageSize);
      stub(Selectors, 'page').returns(page);
      stub(Selectors, 'selectedRefinements').returns(refinements);
      stub(Selectors, 'sort').returns(sort);
      stub(Selectors, 'collection').returns(collection);
      service.beautifier = <any>{ build };
      service['app'].flux = <any>{ emit: () => null };
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
      expect(filterState).to.be.calledWithExactly(state);
      expect(pushState).to.be.calledWith({ url, state: { data }, app: STOREFRONT_APP_ID }, '', url);
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
