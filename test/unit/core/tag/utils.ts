import { StoreSections } from '@storefront/flux-capacitor';
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
      const tag: any = { opts: {}, props: {},
                         config: { options: {} }, parent: { props: { ui, stylish: true } } };
      const getMeta = stub(Tag, 'getMeta').returns({ defaults: {} });
      stub(utils, 'globalConfiguration');

      const props = utils.buildProps(tag);

      expect(getMeta).to.be.calledWith(tag);
      expect(props).to.eql({ ui, stylish: false, storeSection: StoreSections.DEFAULT });
    });

    it('should inherit from parent tag', () => {
      const ui = true;
      const stylish = false;
      const storeSection = 'tessttest';
      const tag: any = { opts: {}, props: {},
                         config: { options: {} }, parent: { props: { ui, stylish, storeSection } } };
      const getMeta = stub(Tag, 'getMeta').returns({ defaults: {} });
      stub(utils, 'globalConfiguration');

      const props = utils.buildProps(tag);

      expect(getMeta).to.be.calledWith(tag);
      expect(props).to.eql({ ui, stylish, storeSection });
    });

    it('should overwrite inherited storeSection with own storeSection', () => {
      const ui = true;
      const stylish = false;
      const storeSection = 'tessttest';
      const tag: any = { opts: {}, props: { storeSection },
                         config: { options: {} }, parent: { props: { ui, stylish, storeSection: 'teeeeest' } } };
      const getMeta = stub(Tag, 'getMeta').returns({ defaults: {} });
      stub(utils, 'globalConfiguration');

      const props = utils.buildProps(tag);

      expect(getMeta).to.be.calledWith(tag);
      expect(props).to.eql({ ui, stylish, storeSection });
    });

    it('should stack configuration', () => {
      const ui = true;
      const stylish = false;
      const defaults = { a: 'b', c: 'd', e: 'f', g: 'h' };
      const globals = { c: 'd1', e: 'f1', g: 'h1' };
      const opts = { g: 'h3', __proto__: { e: 'f2', g: 'h2' } };
      const tag: any = { opts, props: {}, config: { options: { ui, stylish } } };
      const getMeta = stub(Tag, 'getMeta').returns({ defaults });
      const globalConfiguration = stub(utils, 'globalConfiguration').returns(globals);

      const props = utils.buildProps(tag);

      expect(getMeta).to.be.calledWith(tag);
      expect(globalConfiguration).to.be.calledWith(tag);
      expect(props).to.eql({ ui, stylish, storeSection: StoreSections.DEFAULT,
                             a: 'b', c: 'd1', e: 'f2', g: 'h3' });
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

  describe('setMetadata()', () => {
    it('should set update metadata to newly spread object', () => {
      const tag = { a: 'b' };
      const getDescription = stub(Tag, 'getDescription').returns({ metadata: { c: 'd' } });
      const setDescription = stub(Tag, 'setDescription');

      utils.setMetadata(tag, 'configurable', true);

      expect(getDescription).to.be.calledWithExactly(tag);
      expect(setDescription).to.calledWithExactly(tag, { metadata: { c: 'd', configurable: true } });
    });
  });

  describe('wrapActionCreators()', () => {
    it('should wrap each action creator', () => {
      const meta = { a: 'b' };
      const wrappedActionCreator = { c: 'd' };
      const actionCreator1 = () => null;
      const actionCreator2 = () => null;
      const dispatch = () => null;
      const wrapActionCreator = stub(utils, 'wrapActionCreator').returns(wrappedActionCreator);

      const actionCreators = utils.wrapActionCreators({ e: actionCreator1, f: actionCreator2 }, meta, dispatch);

      expect(actionCreators).to.eql({ e: wrappedActionCreator, f: wrappedActionCreator });
      expect(wrapActionCreator).to.be.calledTwice
        .and.calledWithExactly(actionCreator1, meta, dispatch)
        .and.calledWithExactly(actionCreator2, meta, dispatch);
    });
  });

  describe('wrapActionCreator()', () => {
    it('should dispatch augmented action', () => {
      const meta = { a: 'b' };
      const dispatched = { c: 'd' };
      const action = { e: 'f' };
      const augmented = { g: 'h' };
      const dispatch = spy(() => dispatched);
      const actionCreator = spy(() => action);
      const augmentAction = stub(utils, 'augmentAction').returns(augmented);

      const wrappedActionCreator = utils.wrapActionCreator(actionCreator, meta, dispatch);

      expect(wrappedActionCreator('a', 'b', 'c')).to.eql(dispatched);
      expect(augmentAction).to.be.calledWithExactly(action, meta);
      expect(dispatch).to.be.calledWithExactly(augmented);
    });
  });

  describe('wrapThunk()', () => {
    it('should return augmented action thunk', () => {
      const meta = { a: 'b' };
      const augmented = { c: 'd' };
      const action = { e: 'f' };
      const thunk = spy(() => action);
      const getState = () => null;
      const augmentAction = stub(utils, 'augmentAction').returns(augmented);

      const wrappedThunk = utils.wrapThunk(thunk, meta);

      expect(wrappedThunk(getState)).to.eq(augmented);
      expect(augmentAction).to.be.calledWithExactly(action, meta);
      expect(thunk).to.be.calledWithExactly(getState);
    });
  });

  describe('augmentMeta()', () => {
    it('should augment existing metadata', () => {
      const meta = { a: 'b' };

      const action = utils.augmentMeta(<any>{ meta: { c: 'd' } }, meta);

      expect(action).to.eql({ meta: { a: 'b', c: 'd' } });
    });
  });

  describe('augmentAction()', () => {
    it('should wrap thunk', () => {
      const meta = { a: 'b' };
      const wrapped = { c: 'd' };
      const thunk = () => null;
      const wrapThunk = stub(utils, 'wrapThunk').returns(wrapped);

      expect(utils.augmentAction(thunk, meta)).to.eq(wrapped);
      expect(wrapThunk).to.be.calledWithExactly(thunk, meta);
    });

    it('should augment each element of batch action', () => {
      const meta = { a: 'b' };
      const actions: any[] = ['c', 'd'];
      const augmentMeta = stub(utils, 'augmentMeta');
      augmentMeta.withArgs(actions[0], meta).returns('x');
      augmentMeta.withArgs(actions[1], meta).returns('y');

      expect(utils.augmentAction(actions, meta)).to.eql(['x', 'y']);
    });

    it('should augment action metadata', () => {
      const meta = { a: 'b' };
      const action: any = { c: 'd' };
      const augmented = { e: 'f' };
      const augmentMeta = stub(utils, 'augmentMeta').returns(augmented);

      expect(utils.augmentAction(action, meta)).to.eq(augmented);
      expect(augmentMeta).to.be.calledWithExactly(action, meta);
    });

    it('should return unexpected action types', () => {
      const meta = { a: 'b' };
      const action: any = 77;

      expect(utils.augmentAction(action, meta)).to.eq(action);
    });
  });
});
