import * as sinon from 'sinon';
import Tag, { TAG_DESC } from '../../../../src/core/tag';
import Lifecycle from '../../../../src/core/tag/lifecycle';
import utils from '../../../../src/core/tag/utils';
import suite from '../../_suite';

suite('TagUtils', ({ expect, spy, stub }) => {

  describe('bindController()', () => {
    it('should create an initializer', () => {
      const trigger = spy();
      const clazz = () => null;
      const tag: any = { a: 'b', trigger };
      const initSpy = spy();
      const init = function() { initSpy(this); };
      const initializer = stub(utils, 'initializer').returns(init);

      utils.bindController(tag, clazz);

      expect(initializer).to.be.calledWith(clazz);
      expect(initSpy).to.be.calledWith(tag);
      expect(trigger).to.be.calledWith(Lifecycle.Phase.INITIALIZE);
    });

    it('should call init() method if provided', () => {
      const init = spy();
      const clazz = () => null;
      const tag: any = { a: 'b', trigger: () => null, init };
      const initializer = stub(utils, 'initializer').returns(() => null);
      stub(utils, 'primeTagActions');

      utils.bindController(tag, clazz);

      expect(init).to.be.called;
    });
  });

  describe.skip('buildProps()', () => {
    it('should disable stylish if disabling all style', () => {
      const style = false;
      const tag: any = { opts: {}, config: { options: {} }, parent: { props: { style, stylish: true } } };
      const getMeta = stub(Tag, 'getMeta').returns({ defaults: {} });
      stub(utils, 'globalConfiguration');

      const props = utils.buildProps(tag);

      expect(getMeta).to.be.calledWith(tag);
      expect(props).to.eql({ style, stylish: false });
    });

    it('should inherit from parent tag', () => {
      const style = true;
      const stylish = false;
      const tag: any = { opts: {}, config: { options: {} }, parent: { props: { style, stylish } } };
      const getMeta = stub(Tag, 'getMeta').returns({ defaults: {} });
      stub(utils, 'globalConfiguration');

      const props = utils.buildProps(tag);

      expect(getMeta).to.be.calledWith(tag);
      expect(props).to.eql({ style, stylish });
    });

    it('should stack configuration', () => {
      const style = true;
      const stylish = false;
      const defaults = { a: 'b', c: 'd', e: 'f', g: 'h' };
      const globals = { c: 'd1', e: 'f1', g: 'h1' };
      const opts = { g: 'h3', __proto__: { e: 'f2', g: 'h2' } };
      const tag: any = { opts, config: { options: { style, stylish } } };
      const getMeta = stub(Tag, 'getMeta').returns({ defaults });
      const globalConfiguration = stub(utils, 'globalConfiguration').returns(globals);

      const props = utils.buildProps(tag);

      expect(getMeta).to.be.calledWith(tag);
      expect(globalConfiguration).to.be.calledWith(tag);
      expect(props).to.eql({ style, stylish, a: 'b', c: 'd1', e: 'f2', g: 'h3' });
    });
  });

  describe('tagDescriptors()', () => {
    it('should return name, view and css', () => {
      const name = 'my-tag';
      const view = '<div></div>';
      const css = 'background-color: red;';
      const clazz: any = { [TAG_DESC]: { metadata: { name }, view, css } };

      expect(utils.tagDescriptors(clazz)).to.eql([name, view, css]);
    });
  });
});
