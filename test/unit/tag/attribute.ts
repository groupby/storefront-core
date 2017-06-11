import Attribute from '../../../src/tag/attribute';
import suite from '../_suite';

suite('Attribute', ({ expect }) => {
  describe('implyType()', () => {
    it('should use existing type', () => {
      const attribute: any = { type: 'boolean' };

      expect(Attribute.implyType(attribute)).to.eq(attribute);
    });

    it('should imply type from default', () => {
      const attribute: any = { default: 'hat' };

      expect(Attribute.implyType(attribute)).to.eql({ default: 'hat', type: 'string' });
    });

    it('should not imply type if no default', () => {
      const attribute: any = { name: 'colour' };

      expect(Attribute.implyType(attribute)).to.eql(attribute);
    });
  });
});
