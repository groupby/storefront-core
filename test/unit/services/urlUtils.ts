import { Events, Selectors } from '@storefront/flux-capacitor';
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
  });
});
