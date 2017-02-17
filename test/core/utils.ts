import * as deepAssign from 'deep-assign';
import * as log from 'loglevel';
import { utils } from '../../src/core';
import { expect } from '../_suite';

describe('utils', () => {
  it('should include repackaged utilty functions', () => {
    expect(utils.deepAssign).to.eq(deepAssign);
    expect(utils.log).to.eq(log);
  });
});
