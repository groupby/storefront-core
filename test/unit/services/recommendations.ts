import { Events, Selectors } from '@storefront/flux-capacitor';
import Service from '../../../src/services/recommendations';
import * as collectionsService from '../../../src/services/recommendations';
import suite from './_suite';

suite('Recommendations Service', ({ expect, spy, itShouldExtendBaseService }) => {
  let service: Service;

  beforeEach(() => service = new Service(<any>{}, <any>{}));

  describe('constructor()', () => {
    itShouldExtendBaseService(() => service);
  });

  describe('init()', () => {
    it('make initial requests', () => {
      const dispatch = spy();
      const fetchRecommendationsProductsAction = { a: 'b' };
      const fetchPastPurchasesAction = { c: 'f' };
      const fetchRecommendationsProducts = spy(() => fetchRecommendationsProductsAction);
      const fetchPastPurchases = spy(() => fetchPastPurchasesAction);
      service['app'] = <any>{
        flux: {
          store: { dispatch },
          actions: { fetchRecommendationsProducts, fetchPastPurchases }
        }
      };

      service.init();

      expect(dispatch).to.be.calledWithExactly(fetchRecommendationsProductsAction);
      expect(fetchRecommendationsProducts).to.be.called;
      expect(dispatch).to.be.calledWithExactly(fetchPastPurchasesAction);
      expect(fetchPastPurchases).to.be.called;
    });
  });
});
