import PastPurchaseURLParser from '../../../../../src/core/url-beautifier/pastPurchase/parser';
import SearchUrlParser from '../../../../../src/core/url-beautifier/search/parser';
import suite from '../../../_suite';

suite('PastPurchaseUrlParser', ({ expect }) => {
  it('should extend search url parser', () => {
    const past = new PastPurchaseURLParser(<any>{ config: {} });
    expect(past instanceof SearchUrlParser).to.be.true;
  });
});
