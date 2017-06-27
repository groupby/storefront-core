import { expect } from 'chai';
import * as suite from 'mocha-suite';
import * as sinon from 'sinon';
import UrlBeautifier from '../../src/core/url-beautifier';

export interface Utils {
  expect: Chai.ExpectStatic;
  spy: sinon.SinonSpyStatic;
  stub: sinon.SinonStubStatic;
}

export default suite<Utils, any>((tests) => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => sandbox = sinon.sandbox.create());
  afterEach(() => sandbox.restore());

  tests({
    expect,
    spy: (...args) => (<any>sandbox.spy)(...args),
    stub: (...args) => (<any>sandbox.stub)(...args)
  });
});

export function refinement(field: string, value: any): UrlBeautifier.ValueRefinement;
export function refinement(field: string, low: number, high: number): UrlBeautifier.RangeRefinement;
export function refinement(field: string, valueOrLow: any, high?: number): UrlBeautifier.Refinement {
  if (high) {
    return { field, low: valueOrLow, high };
  } else {
    return { field, value: valueOrLow };
  }
}
