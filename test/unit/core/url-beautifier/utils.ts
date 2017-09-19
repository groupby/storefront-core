import * as utils from '../../../../src/core/url-beautifier/utils';
import suite from '../../_suite';

suite('URL beautifier', ({ expect }) => {
  describe('encodeArray()', () => {
    it('should encode array in right form', () => {
      // tslint:disable-next-line max-line-length
      expect(utils.encodeArray([['brand', ['thing']], ['test', ['whatever']], ['price', [1,2]]])).to.eq('brand:thing,test:whatever,price:1..2');
    });
  });

  describe('decodeArray()', () => {
    it('should encode array in right form', () => {
      // tslint:disable-next-line max-line-length
      expect(utils.decodeArray('brand:thing,test:whatever,price:1..2')).to.eql([['brand', 'thing'], ['test', 'whatever'], ['price', [1,2]]]);
    });
  });

  describe('encodeChars()', () => {
    it('should encode string in right form', () => {
      expect(utils.encodeChars('testing this thing out-eyy')).to.eq('testing-this-thing-out%252Deyy');
    });
  });

  describe('decodeChars()', () => {
    it('should encode string in right form', () => {
      expect(utils.decodeChars('testing-this-thing-out%252Deyy')).to.eq('testing this thing out-eyy');
    });
  });

  describe('splitExceptEscaped', () => {
    it('should split strings to correct arrays', () => {
      expect(utils.splitExceptEscaped('hello\\..wor..l\\..d', '..')).to.eql(['hello..wor','l..d']);
      expect(utils.splitExceptEscaped('.....a','.')).to.eql(['','','','','','a']);
    });
  });

  describe('escapeSeparators', () => {
    it('should escape the separator characters', () => {
      expect(utils.escapeSeparators('h:ello,wor..ld')).to.eq('h\\:ello\\,wor\\..ld');
      expect(utils.escapeSeparators('h:::::ello,wor..ld')).to.eq('h\\:\\:\\:\\:\\:ello\\,wor\\..ld');
    });
  });
});
