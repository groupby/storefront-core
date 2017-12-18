import PastPurchaseURLGenerator from '../../../../../src/core/url-beautifier/pastPurchase/generator';
import SearchUrlGenerator from '../../../../../src/core/url-beautifier/search/generator';
import suite from '../../../_suite';

suite('PastPurchaseUrlGenerator', ({ expect }) => {
  it('should extend search url generator', () => {
    const past = new PastPurchaseURLGenerator(<any>{});
    expect(past instanceof SearchUrlGenerator).to.be.true;
  });
});
