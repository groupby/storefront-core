import * as utils from '../../../src/core/utils';
import Tag, { TAG_DESC, TAG_META } from '../../../src/tag';
import Alias from '../../../src/tag/alias';
import * as aliasing from '../../../src/tag/alias';
import Lifecycle from '../../../src/tag/lifecycle';
import suite from '../_suite';

suite('Tag', ({ expect, spy, stub }) => {

  describe('Base Tag', () => {
    let tag: Tag;
    let tagAlias: Alias;
    let alias: sinon.SinonStub;
    let lifecycleAttach: sinon.SinonStub;
    let attach: sinon.SinonSpy;

    beforeEach(() => {
      tagAlias = <any>{ attach: attach = spy() };
      alias = stub(aliasing, 'default').returns(tagAlias);
      lifecycleAttach = stub(Lifecycle, 'attach');
      tag = new Tag();
    });

    describe('constructor()', () => {
      it('should set initial values', () => {
        expect(tag.props).to.eql({});
        expect(tag.state).to.eql({});
        expect(tag.aliasing).to.eq(tagAlias);
      });

      it('should attach listeners', () => {
        expect(attach).to.be.called;
        expect(lifecycleAttach).to.be.calledWith(tag);
      });
    });

    describe('set()', () => {
      it('should update the state', () => {
        const update = tag.update = spy();
        tag.state = { a: 'b' };

        tag.set({ c: 'd' });

        expect(update).to.be.calledWith({ state: { a: 'b', c: 'd' } });
      });
    });

    describe('dispatch()', () => {
      it('should dispatch an action to flux.store', () => {
        const dispatch = spy();
        const action: any = { a: 'b' };
        tag.flux = <any>{ store: { dispatch } };

        tag.dispatch(action);

        expect(dispatch).to.be.calledWith(action);
      });
    });

    describe('expose()', () => {
      it('should call aliasing.expose()', () => {
        const name = 'thing1';
        const value = 'thing2';
        const expose = spy();
        tag.aliasing = <any>{ expose };

        tag.expose(name, value);

        expect(expose).to.be.calledWith(name, value);
      });
    });

    describe('unexpose()', () => {
      it('should call aliasing.unexpose()', () => {
        const name = 'thing1';
        const unexpose = spy();
        tag.aliasing = <any>{ unexpose };

        tag.unexpose(name);

        expect(unexpose).to.be.calledWith(name);
      });
    });

    describe('updateAlias()', () => {
      it('should call aliasing.updateAlias()', () => {
        const name = 'thing1';
        const value = 'thing2';
        const updateAlias = spy();
        tag.aliasing = <any>{ updateAlias };

        tag.updateAlias(name, value);

        expect(updateAlias).to.be.calledWith(name, value);
      });
    });
  });

  describe('mixin()', () => {
    it('should add properties from app', () => {
      const services = { a: 'b' };
      const config = { c: 'd' };

      const mixin = Tag.mixin(<any>{ services, config });

      expect(mixin.services).to.eq(services);
      expect(mixin.config).to.eq(config);
    });

    it('should create initialization method', () => {
      const tag = {};
      const initializer = stub(Tag, 'initializer');
      const mixin = Tag.mixin(<any>{});

      expect(initializer).to.be.calledWith(Tag);
    });
  });

  describe('register()', () => {
    it('should create an initializer', () => {
      const trigger = spy();
      const clazz = () => null;
      const tag: any = { a: 'b', trigger };
      const initSpy = spy();
      const init = function() { initSpy(this); };
      const initializer = stub(Tag, 'initializer').returns(init);

      Tag.register(tag, clazz);

      expect(initializer).to.be.calledWith(clazz);
      expect(initSpy).to.be.calledWith(tag);
      expect(trigger).to.be.calledWith(Lifecycle.Phase.INITIALIZE);
    });

    it('should call init() method if provided', () => {
      const init = spy();
      const clazz = () => null;
      const tag: any = { a: 'b', trigger: () => null, init };
      const initializer = stub(Tag, 'initializer').returns(() => null);

      Tag.register(tag, clazz);

      expect(init).to.be.called;
    });
  });

  describe('getDefaults()', () => {
    it('should extract defaults', () => {
      const defaults = { a: 'b' };
      const tag: any = { c: 'd' };
      const getMeta = stub(Tag, 'getMeta').returns({ defaults });

      expect(Tag.getDefaults(tag)).to.eq(defaults);
      expect(getMeta).to.be.calledWith(tag);
    });

    it('should have default value', () => {
      stub(Tag, 'getMeta').returns({});

      expect(Tag.getDefaults(<any>{})).to.eql({});
    });
  });

  describe('getMeta()', () => {
    it('should extract meta', () => {
      const meta = { a: 'b' };
      const tag: any = { [TAG_META]: meta };

      expect(Tag.getMeta(tag)).to.eq(meta);
    });

    it('should have default value', () => {
      expect(Tag.getMeta(<any>{})).to.eql({});
    });
  });

  describe('getDescription()', () => {
    it('should extract description', () => {
      const description = { a: 'b' };
      const clazz: any = { [TAG_DESC]: description };

      expect(Tag.getDescription(clazz)).to.eq(description);
    });

    it('should have and set a default value', () => {
      const clazz: any = {};

      const description = Tag.getDescription(clazz);

      expect(description).to.eql({});
      expect(clazz[TAG_DESC]).to.eq(description);
    });
  });

  describe('buildProps()', () => {
    it('should stack configuration', () => {
      const stylish = true;
      const defaults = { a: 'b', c: 'd', e: 'f' };
      const opts = { e: 'f2', __proto__: { c: 'd1', e: 'f1' } };
      const tag: any = { opts, config: { options: { stylish } } };
      const getDefaults = stub(Tag, 'getDefaults').returns(defaults);

      const props = Tag.buildProps(tag);

      expect(getDefaults).to.be.calledWith(tag);
      expect(props).to.eql({ stylish, a: 'b', c: 'd1', e: 'f2' });
    });
  });
});
