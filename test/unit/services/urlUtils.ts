import { Adapters, Events, Selectors } from '@storefront/flux-capacitor';
import * as sinon from 'sinon';
import CoreSelectors from '../../../src/core/selectors';
import { BaseService, CORE } from '../../../src/core/service';
import * as UrlBeautifier from '../../../src/core/url-beautifier';
import * as CoreUtils from '../../../src/core/utils';
import Utils from '../../../src/services/urlUtils';
import suite from './_suite';

suite('URL Service', ({ expect, spy, stub }) => {
  let win;

  beforeEach(() => {
    win = { addEventListener: spy() };
    stub(CoreUtils, 'WINDOW').returns(win);
  });

  describe('static', () => {
    describe('getBasePath()', () => {
      it('should get base URL path', () => {
        const baseURI = 'http://example.com/base/path';
        win.document = { baseURI };
        win.location = { pathname: '/not/base/path' };

        expect(Utils.getBasePath()).to.eq('/base/path');
      });

      it('should return the empty string for no defined base tag', () => {
        const pathname = '/base/path';
        const baseURI = `http://example.com${pathname}`;
        win.document = { baseURI };
        win.location = { pathname };

        expect(Utils.getBasePath()).to.eq('');
      });

      it('should strip trailing slashes', () => {
        const baseURI = 'http://example.com/base/path/';
        win.document = { baseURI };
        win.location = { pathname: '/not/base/path' };

        expect(Utils.getBasePath()).to.eq('/base/path');
      });
    });

    describe('searchUrlState()', () => {
      it('should return search url state', () => {
        const state: any = { a: 'b' };
        const query = 'hi';
        const page = 2;
        const pageSize = 30;
        const refinements = [
          { type: 'Value', navigationName: 'first', value: 'one' },
          { type: 'Range', navigationName: 'second', low: 1, high: 2 }
        ];
        const sort = { c: 'd' };
        const collection = 'a collection';
        stub(Selectors, 'query').withArgs(state).returns(query);
        stub(Selectors, 'page').withArgs(state).returns(page);
        stub(Selectors, 'pageSize').withArgs(state).returns(pageSize);
        stub(Selectors, 'selectedRefinements').withArgs(state).returns(refinements);
        stub(Selectors, 'sort').withArgs(state).returns(sort);
        stub(Selectors, 'collection').withArgs(state).returns(collection);

        expect(Utils.searchUrlState(state)).to.eql({
          query,
          page,
          pageSize,
          refinements: [
            { field: 'first', value: 'one' },
            { field: 'second', low: 1, high: 2 }
          ],
          sort,
          collection
        });
      });
    });

    describe('detailsUrlState()', () => {
      it('should return details url state', () => {
        const state: any = 'state';
        const ret = { data: 'dat' };
        const details = stub(CoreSelectors, 'transformedDetailsProduct').returns(ret);
        expect(Utils.detailsUrlState(state)).to.eql({
          data: ret.data,
          variants: [],
        });
        expect(details).to.be.calledWithExactly(state);
      });
    });

    describe('navigationUrlState()', () => {
      it('should return navigation url state', () => {
        const state: any = 'state';
        expect(Utils.navigationUrlState(state)).to.eql({});
      });
    });

    describe('pastPurchaseUrlState()', () => {
      it('should return pastPurchase url state', () => {
        const state: any = 'state';
        const sorts = { selected: 1, items: ['a', 'b', 'c'] };
        const query = 'q';
        const page = 'p';
        const pageSize = 's';
        const selected = [
          { navigationName: 'f', value: 'c', type: 'Value' },
          { navigationName: 'r', value: 'j', type: 'Value' },
        ];
        const refinements = [{ field: 'f', value: 'c' }, { field: 'r', value: 'j' }];
        const pastPurchaseSort = stub(Selectors, 'pastPurchaseSort').returns(sorts);
        const pastPurchaseQuery = stub(Selectors, 'pastPurchaseQuery').returns(query);
        const pastPurchasePage = stub(Selectors, 'pastPurchasePage').returns(page);
        const pastPurchasePageSize = stub(Selectors, 'pastPurchasePageSize').returns(pageSize);
        const pastPurchaseSelectedRefinements = stub(Selectors, 'pastPurchaseSelectedRefinements').returns(selected);
        expect(Utils.pastPurchaseUrlState(state)).to.eql({
          query,
          page,
          pageSize,
          sort: sorts.items[sorts.selected],
          refinements,
          collection: null,
        });
        expect(pastPurchaseSort).to.be.calledWithExactly(state);
        expect(pastPurchaseQuery).to.be.calledWithExactly(state);
        expect(pastPurchasePage).to.be.calledWithExactly(state);
        expect(pastPurchasePageSize).to.be.calledWithExactly(state);
        expect(pastPurchaseSelectedRefinements).to.be.calledWithExactly(state);
      });
    });

    describe('searchStateToRequest()', () => {
      it('should return search request based off given state', () => {
        const collection = 'a collection';
        const page = 324;
        const pageSize = 25;
        const query = 'dress';
        const refinements = [1,2,3,4,5];
        const sort = { a: 'b' };
        const state: any = {
          collection,
          page,
          pageSize,
          query,
          refinements,
          sort
        };
        const store: any = { c: 'd' };
        const skip = 30;
        stub(Adapters.Request, 'extractRefinement').returnsArg(1);
        stub(Adapters.Request, 'extractSkip').withArgs(page).returns(skip);
        stub(Adapters.Request, 'extractSort').withArgs(sort).returns(sort);

        expect(Utils.searchStateToRequest(state, store)).to.eql({
          pageSize,
          skip,
          collection,
          query,
          refinements,
          sort,
        });
      });

      it('should return search request based off store', () => {
        const collection = 'a collection';
        const page = 324;
        const pageSize = 25;
        const query = 'dress';
        const sort = { a: 'b' };
        const state: any = { refinements: [] };
        const store: any = { c: 'd' };
        const skip = 30;
        stub(Selectors, 'pageSize').withArgs(store).returns(pageSize);
        stub(Adapters.Request, 'clampPageSize').withArgs(1, pageSize).returns(pageSize);
        stub(Selectors, 'collection').withArgs(store).returns(collection);
        stub(Selectors, 'currentQuery').withArgs(store).returns(query);
        stub(Adapters.Request, 'extractRefinement').returnsArg(1);
        stub(Adapters.Request, 'extractSkip').withArgs(1).returns(skip);
        stub(Selectors, 'sort').withArgs(store).returns(sort);
        stub(Adapters.Request, 'extractSort').withArgs(sort).returns(sort);

        expect(Utils.searchStateToRequest(state, store)).to.eql({
          pageSize,
          skip,
          collection,
          query,
          refinements: [],
          sort,
        });
      });
    });

    describe('pastPurchaseStateToRequest()', () => {
      it('should return past purchase request based off given state', () => {
        const collection = 'a collection';
        const page = 324;
        const pageSize = 25;
        const query = 'dress';
        const refinements = [1,2,3,4,5];
        const sort = { a: 'b' };
        const state: any = {
          collection,
          page,
          pageSize,
          query,
          refinements,
          sort
        };
        const store: any = { c: 'd' };
        const skip = 30;
        stub(Adapters.Request, 'extractRefinement').returnsArg(1);
        stub(Adapters.Request, 'extractSkip').withArgs(page).returns(skip);
        stub(Adapters.Request, 'extractSort').withArgs(sort).returns(sort);

        expect(Utils.pastPurchaseStateToRequest(state, store)).to.eql({
          pageSize,
          skip,
          collection,
          query,
          refinements,
          sort,
        });
      });

      it('should return past purchase request based off store', () => {
        const collection = 'a collection';
        const page = 324;
        const pageSize = 25;
        const query = 'dress';
        const sort = { a: 'b' };
        const state: any = { refinements: [] };
        const store: any = { c: 'd' };
        const skip = 30;
        stub(Selectors, 'pastPurchasePageSize').withArgs(store).returns(pageSize);
        stub(Adapters.Request, 'clampPageSize').withArgs(1, pageSize).returns(pageSize);
        stub(Selectors, 'collection').withArgs(store).returns(collection);
        stub(Selectors, 'pastPurchaseQuery').withArgs(store).returns(query);
        stub(Adapters.Request, 'extractRefinement').returnsArg(1);
        stub(Adapters.Request, 'extractSkip').withArgs(1).returns(skip);
        stub(Selectors, 'sort').withArgs(store).returns(sort);
        stub(Adapters.Request, 'extractSort').withArgs(sort).returns(sort);

        expect(Utils.pastPurchaseStateToRequest(state, store)).to.eql({
          pageSize,
          skip,
          collection,
          query,
          refinements: [],
          sort,
        });
      });
    });
  });
});
