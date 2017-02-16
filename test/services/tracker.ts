import { expect } from 'chai';
import Tracker, { DEFAULTS } from '../../src/services/tracker';

describe('Tracker Service', () => {
  it('should set defaults', () => {
    const app: any = {
      registry: { register: () => null },
      config: { customerId: 'mycustomer' }
    };

    expect(new Tracker(app).config).to.eql(DEFAULTS);
  });
});
