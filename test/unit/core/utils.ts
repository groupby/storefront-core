import * as deepAssign from 'deep-assign';
import * as GbTracker from 'gb-tracker-client';
import * as log from 'loglevel';
import * as riot from 'riot';
import * as sinon from 'sinon';
import Tag, { TAG_DESC, TAG_META } from '../../../src/core/tag';
import * as utils from '../../../src/core/utils';
import suite from '../_suite';

suite('utils', ({ expect, spy, stub }) => {
  it('should include repackaged utilty functions', () => {
    expect(utils.deepAssign).to.eq(deepAssign);
    expect(utils.log).to.eq(log);
    expect(utils.riot).to.eq(riot);
    expect(utils.GbTracker).to.eq(GbTracker);
  });

  describe('dot', () => {
    describe('get()', () => {
      it('should return nested value', () => {
        const obj = { a: { bcd: [{}, { 5: { name: [{ '%valu!': 'e' }] } }] } };

        expect(utils.dot.get(obj, 'a.bcd.1.5.name.0.%valu!')).to.eq('e');
      });

      it('should return default value if no nested value found', () => {
        const defaultValue = 'mark';
        const obj = { a: { bcd: [{}, { 5: { name: [{ '%valu!': 'e' }] } }] } };

        expect(utils.dot.get(obj, 'a.bcd.1.5.name.0.%valur!', defaultValue)).to.eq(defaultValue);
      });

      it('should bail out if path is invalid', () => {
        const defaultValue = 'mark';
        const obj = { a: { bcd: [{}, { 5: { name: [{ '%valu!': 'e' }] } }] } };

        expect(utils.dot.get(obj, 'a.bcd.label.ha.3', defaultValue)).to.eq(defaultValue);
      });
    });
  });

  describe('mapToSearchActions()', () => {
    it('should turn links into flux actions', () => {
      const search = spy();
      const values: any[] = ['a', 'b'];

      const mapped = utils.mapToSearchActions(values, <any>{ search });

      expect(mapped[0]).to.have.keys('value', 'onClick');
      expect(mapped[1]).to.have.keys('value', 'onClick');

      mapped[1].onClick();

      expect(search).to.be.calledWith('b');
    });
  });

  describe('rayify()', () => {
    it('should return the value in an array', () => {
      expect(utils.rayify('a')).to.eql(['a']);
    });

    it('should return the original array', () => {
      const value = ['v'];

      expect(utils.rayify(value)).to.eq(value);
    });
  });

  // TODO: add these as integration tests
  describe.skip('WINDOW', () => {
    describe('Image()', () => {
      it('should return a new image', () => {
        expect(utils.WINDOW.Image()).to.be.an.instanceOf(Image);
      });
    });
  });
});
