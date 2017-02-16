import { expect } from 'chai';
import * as sinon from 'sinon';
import StoreFront from '../src/storefront';
import * as system from '../src/system';

describe('StoreFront', () => {
  let sb: sinon.SinonSandbox;

  beforeEach(() => sb = sinon.sandbox.create());
  afterEach(() => sb.restore());

  it('should be a singleton', () => {
    sb.stub(system, 'default', () => ({
      initServices: () => null,
      initMixin: () => null
    }));

    const storefront = new StoreFront(<any>{});

    expect(storefront).to.be.ok;
    expect(StoreFront._instance).to.eq(storefront);
    expect(new StoreFront(<any>{})).to.eq(storefront);
  });
});
