import { expect } from 'chai';
import { SelectedRangeRefinement, SelectedRefinement, SelectedValueRefinement } from 'groupby-api';
import * as suite from 'mocha-suite';
import * as sinon from 'sinon';

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

export function refinement(field: string, value: any): SelectedValueRefinement;
export function refinement(field: string, low: number, high: number): SelectedRangeRefinement;
export function refinement(navigationName: string, valueOrLow: any, high?: number): SelectedRefinement {
  if (high) {
    return { navigationName, low: valueOrLow, high, type: 'Range' };
  } else {
    return { navigationName, value: valueOrLow, type: 'Value' };
  }
}
