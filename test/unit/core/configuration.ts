import { utils, Configuration } from '../../../src/core';
import DEFAULTS from '../../../src/core/defaults';
import suite from '../_suite';

const Transformer = Configuration.Transformer;

suite('Configuration', ({ expect, stub }) => {
  describe('Transformer', () => {
    describe('transform()', () => {
      it('should transform the raw configuration', () => {
        const config: any = {};
        const deprecationTransform = stub(Transformer, 'deprecationTransform');
        stub(Transformer, 'applyDefaults');
        stub(Transformer, 'validate');

        Transformer.transform(config);

        expect(deprecationTransform).to.be.calledWith(config);
      });

      it('should apply default configuration', () => {
        const config = {};
        const applyDefaults = stub(Transformer, 'applyDefaults');
        stub(Transformer, 'deprecationTransform').returns(config);
        stub(Transformer, 'validate');

        Transformer.transform(<any>{});

        expect(applyDefaults).to.be.calledWith(config);
      });

      it('should validate the final configuration', () => {
        const config: any = {};
        const validate = stub(Transformer, 'validate');
        stub(Transformer, 'deprecationTransform');
        stub(Transformer, 'applyDefaults').returns(config);

        const finalConfig = Transformer.transform(<any>{});

        expect(finalConfig).to.eq(config);
        expect(validate).to.be.calledWith(config);
      });
    });

    describe('deprecationTransform()', () => {
      it('should return input', () => {
        const config: any = {};

        expect(Transformer.deprecationTransform(config)).to.eq(config);
      });
    });

    describe('applyDefaults', () => {
      it('should deeply assign the configuration with defaults', () => {
        const withDefaults = {};
        const config: any = {};
        const deepAssign = stub(utils, 'deepAssign').returns(withDefaults);

        const finalConfig = Transformer.applyDefaults(config);

        expect(finalConfig).to.eq(withDefaults);
        expect(deepAssign).to.be.calledWith({}, DEFAULTS, config);
      });
    });

    describe('validate()', () => {
      it('should not throw an error', () => {
        expect(() => Transformer.validate(<any>{})).to.not.throw();
      });
    });
  });
});
