import * as service from '../../../../src/core/service';
import suite from '../../_suite';

suite('Service', ({ expect }) => {

  describe('@core', () => {
    it('should mark as core service', () => {
      const tag = {};

      service.core(tag);

      expect(tag[service.CORE]).to.be.true;
    });
  });
});
