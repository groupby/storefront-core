import * as _ from 'mocha-suite';
import { BaseService } from '../../../src/core/service';
import { CORE } from '../../../src/core/service';
import * as suite from '../_suite';

export default suite.extendable((utils) => ({
  ...utils,
  itShouldBeCore: (clazz) =>
    describe('@core', () =>
      it('should set core to be true', () =>
        utils.expect(clazz[CORE]).to.be.true)),
  itShouldExtendBaseService: (serviceFactory: () => BaseService) =>
    it('should extend BaseService', () =>
      utils.expect(serviceFactory()).to.be.an.instanceOf(BaseService))
}));
