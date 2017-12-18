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
    it('make initial request', () => {
      const dispatch = spy();
      const fetchRecommendationsProductsAction = { a: 'b' };
      const fetchRecommendationsProducts = spy(() => fetchRecommendationsProductsAction);
      service['app'] = <any>{
        flux: {
          store: { dispatch },
          actions: { fetchRecommendationsProducts }
        }
      };

      service.init();

      expect(dispatch).to.be.calledWithExactly(fetchRecommendationsProductsAction);
      expect(fetchRecommendationsProducts).to.be.called;
    });
  });
});
