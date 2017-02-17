import { log } from '../../src/core/utils';
import Logging from '../../src/services/logging';
import { expect, sinon } from '../_suite';

describe('Logging', () => {
  afterEach(() => sinon.restore());

  describe('constructor()', () => {
    it('should set log level', () => {
      const setLevel = sinon.stub(log, 'setLevel');

      new Logging(<any>{}, { level: 'warn' }); // tslint:disable-line:no-unused-new

      expect(setLevel.calledWith('warn')).to.be.true;
    });
  });

  describe('init()', () => {
    it('should set log', () => {
      const app: any = {};

      new Logging(app, { level: 'debug' }).init();

      expect(app.log).to.eq(log);
    });
  });
});
