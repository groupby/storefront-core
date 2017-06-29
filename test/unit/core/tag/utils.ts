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

  describe('globalConfiguration()', () => {
    it('should extract configuration for tag if configurable', () => {
      const config = { a: 'b' };
      const tag: any = { config: { tags: { myTag: config } } };
      const getMeta = stub(Tag, 'getMeta').returns({ configurable: true, name: 'gb-my-tag' });

      const globalConfig = utils.globalConfiguration(tag);

      expect(getMeta).to.be.calledWith(tag);
      expect(globalConfig).to.eq(config);
    });

    it('should not extract configuration for tag if not configurable', () => {
      const tag: any = {};
      stub(Tag, 'getMeta').returns({ configurable: false, name: 'gb-my-tag' });

      expect(utils.globalConfiguration(tag)).to.eql({});
    });
  });

  describe('buildProps()', () => {
    it('should disable stylish if disabling all style', () => {
      const ui = false;
      const tag: any = { opts: {}, config: { options: {} }, parent: { props: { ui, stylish: true } } };
      const getMeta = stub(Tag, 'getMeta').returns({ defaults: {} });
      stub(utils, 'globalConfiguration');

      const props = utils.buildProps(tag);

      expect(getMeta).to.be.calledWith(tag);
      expect(props).to.eql({ ui, stylish: false });
    });

    it('should inherit from parent tag', () => {
      const ui = true;
      const stylish = false;
      const tag: any = { opts: {}, config: { options: {} }, parent: { props: { ui, stylish } } };
      const getMeta = stub(Tag, 'getMeta').returns({ defaults: {} });
      stub(utils, 'globalConfiguration');

      const props = utils.buildProps(tag);

      expect(getMeta).to.be.calledWith(tag);
      expect(props).to.eql({ ui, stylish });
    });

    it('should stack configuration', () => {
      const ui = true;
      const stylish = false;
      const defaults = { a: 'b', c: 'd', e: 'f', g: 'h' };
      const globals = { c: 'd1', e: 'f1', g: 'h1' };
      const opts = { g: 'h3', __proto__: { e: 'f2', g: 'h2' } };
      const tag: any = { opts, config: { options: { ui, stylish } } };
      const getMeta = stub(Tag, 'getMeta').returns({ defaults });
      const globalConfiguration = stub(utils, 'globalConfiguration').returns(globals);

      const props = utils.buildProps(tag);

      expect(getMeta).to.be.calledWith(tag);
      expect(globalConfiguration).to.be.calledWith(tag);
      expect(props).to.eql({ ui, stylish, a: 'b', c: 'd1', e: 'f2', g: 'h3' });
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
