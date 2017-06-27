import * as deepAssign from 'deep-assign';
import * as log from 'loglevel';
import * as riot from 'riot';
import * as sinon from 'sinon';
import * as utils from '../../../src/core/utils';
import Tag, { TAG_DESC, TAG_META } from '../../../src/tag';
import suite from '../_suite';

suite('utils', ({ expect, spy, stub }) => {
  it('should include repackaged utilty functions', () => {
    expect(utils.deepAssign).to.eq(deepAssign);
    expect(utils.log).to.eq(log);
    expect(utils.riot).to.eq(riot);
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

  describe('register()', () => {
    it('should call riot.tag()', () => {
      const tag = spy();
      const clazz = () => null;
      const meta = { c: 'd' };
      const register = stub(Tag, 'register');
      const readClassDecorators = stub(utils, 'readClassDecorators').returns(['a', 'b']);
      const readClassMeta = stub(utils, 'readClassMeta').returns(meta);

      utils.register({ tag })(clazz);

      expect(readClassDecorators).to.be.calledWith(clazz);
      expect(tag).to.be.calledWith('a', 'b', sinon.match((cb) => {
        const instance = new cb();

        expect(instance[TAG_META]).to.eq(meta);
        expect(readClassMeta).to.be.calledWith(clazz);
        return expect(register).to.be.calledWith(sinon.match.any, clazz);
      }));
    });
  });

  describe('readClassMeta()', () => {
    it('should return tag metadata', () => {
      const name = 'my-tag';
      const alias = 'myTag';
      const defaults = { a: 'b' };
      const attributes = ['c', 'd'];
      const clazz: any = { [TAG_DESC]: { alias, name, defaults, attributes, e: 'f' } };

      expect(utils.readClassMeta(clazz)).to.eql({ alias, name, defaults, attributes });
    });
  });

  describe('readClassDecorators()', () => {
    it('should return name, view and css', () => {
      const name = 'my-tag';
      const view = '<div></div>';
      const css = 'background-color: red;';
      const clazz: any = { [TAG_DESC]: { name, view, css } };

      expect(utils.readClassDecorators(clazz)).to.eql([name, view, css]);
    });
  });

  describe('mapToSearchActions()', () => {
    it('should turn links into flux actions', () => {
      const search = spy();
      const links: any[] = [{ value: 'a' }, { value: 'b' }];

      const mapped = utils.mapToSearchActions(links, <any>{ search });

      expect(mapped).to.have.length(2);
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
