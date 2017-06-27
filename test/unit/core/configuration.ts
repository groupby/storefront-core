import Configuration from '../../../src/core/configuration';
import DEFAULTS from '../../../src/core/defaults';
import * as utils from '../../../src/core/utils';
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
      const CONFIG: any = { customerId: 'a' };

      it('should check for customerId', () => {
        const error = 'must provide a customer ID';

        expect(() => Transformer.validate(<any>{})).to.throw(error);
        expect(() => Transformer.validate(<any>{ customerId: null })).to.throw(error);
        expect(() => Transformer.validate(<any>{ customerId: undefined })).to.throw(error);
        expect(() => Transformer.validate(<any>{ customerId: '' })).to.throw(error);
      });

      it('should check for structure', () => {
        const error = 'must provide a record structure';

        expect(() => Transformer.validate(CONFIG)).to.throw(error);
        expect(() => Transformer.validate({ ...CONFIG, structure: null })).to.throw(error);
        expect(() => Transformer.validate({ ...CONFIG, structure: undefined })).to.throw(error);
      });

      it('should check for structure.id', () => {
        const error = 'structure.id must be the path to the id field';

        expect(() => Transformer.validate({ ...CONFIG, structure: {} })).to.throw(error);
        expect(() => Transformer.validate({ ...CONFIG, structure: { id: null } })).to.throw(error);
        expect(() => Transformer.validate({ ...CONFIG, structure: { id: undefined } })).to.throw(error);
        expect(() => Transformer.validate({ ...CONFIG, structure: { id: '' } })).to.throw(error);
      });

      it('should check for structure.title', () => {
        const error = 'structure.title must be the path to the title field';

        expect(() => Transformer.validate({ ...CONFIG, structure: { id: 'b' } })).to.throw(error);
        expect(() => Transformer.validate({ ...CONFIG, structure: { id: 'b', title: null } })).to.throw(error);
        expect(() => Transformer.validate({ ...CONFIG, structure: { id: 'b', title: undefined } })).to.throw(error);
        expect(() => Transformer.validate({ ...CONFIG, structure: { id: 'b', title: '' } })).to.throw(error);
      });

      it('should check for structure.price', () => {
        const error = 'structure.price must be the path to the price field';
        const struct = { id: 'b', title: 'c' };

        expect(() => Transformer.validate({ ...CONFIG, structure: struct })).to.throw(error);
        expect(() => Transformer.validate({ ...CONFIG, structure: { ...struct, price: null } })).to.throw(error);
        expect(() => Transformer.validate({ ...CONFIG, structure: { ...struct, price: undefined } })).to.throw(error);
        expect(() => Transformer.validate({ ...CONFIG, structure: { ...struct, price: '' } })).to.throw(error);
      });
    });
  });
});
