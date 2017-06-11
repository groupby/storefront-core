import { log } from '../../../src/core/utils';
import LoggingService from '../../../src/services/logging';
import suite from '../_suite';

suite('Logging', ({ expect, stub }) => {

  describe('constructor()', () => {
    it('should set log level', () => {
      const setLevel = stub(log, 'setLevel');

      new LoggingService(<any>{}, { level: 'warn' }); // tslint:disable-line:no-unused-new

      expect(setLevel).to.be.calledWith('warn');
    });
  });

  describe('init()', () => {
    it('should set log', () => {
      const app: any = { flux: { on: () => null } };

      new LoggingService(app, { level: 'debug' }).init();

      expect(app.log).to.eq(log);
    });
  });
});
