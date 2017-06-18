import { BaseService } from '../../../src/core/service';
import { log } from '../../../src/core/utils';
import Service from '../../../src/services/logging';
import suite from '../_suite';

suite('Logging Service', ({ expect, stub }) => {

  describe('constructor()', () => {
    it('should extend BaseService', () => {
      expect(new Service(<any>{}, <any>{ level: 'info' })).to.be.an.instanceOf(BaseService);
    });

    it('should set log level', () => {
      const setLevel = stub(log, 'setLevel');

      new Service(<any>{}, { level: 'warn' }); // tslint:disable-line:no-unused-new

      expect(setLevel).to.be.calledWith('warn');
    });
  });

  describe('init()', () => {
    it('should set log', () => {
      const app: any = { flux: { on: () => null } };

      new Service(app, { level: 'debug' }).init();

      expect(app.log).to.eq(log);
    });
  });
});
